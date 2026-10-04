package com.melit.listacompra.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.melit.listacompra.IntegrationTest;
import com.melit.listacompra.domain.CategoriaProducto;
import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.domain.TipoLista;
import com.melit.listacompra.domain.UnidadMedida;
import com.melit.listacompra.domain.User;
import com.melit.listacompra.repository.ItemListaRepository;
import com.melit.listacompra.repository.ProductoRepository;
import com.melit.listacompra.repository.UserRepository;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Comprueba que cada usuario solo puede acceder a sus propios productos y elementos de lista.
 * "usuarioa" es el propietario de los datos y "usuariob" intenta acceder a ellos.
 */
@IntegrationTest
@AutoConfigureMockMvc
@Transactional
class PropiedadDatosIT {

    private static final String PROPIETARIO = "usuarioa";
    private static final String INTRUSO = "usuariob";

    private static final String PRODUCTO_JSON =
        "{\"nombre\":\"modificado\",\"precio\":9.99,\"categoria\":\"ALIMENTACION\",\"unidadMedida\":\"UNIDAD\",\"cantidadPorDefecto\":1}";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntityManager em;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ItemListaRepository itemListaRepository;

    private User propietario;
    private User intruso;
    private Producto producto;
    private ItemLista item;

    @BeforeEach
    void initTest() {
        propietario = crearUsuario(PROPIETARIO);
        intruso = crearUsuario(INTRUSO);

        producto = new Producto();
        producto.setNombre("leche");
        producto.setPrecio(new BigDecimal("1.20"));
        producto.setCategoria(CategoriaProducto.ALIMENTACION);
        producto.setUnidadMedida(UnidadMedida.L);
        producto.setCantidadPorDefecto(1);
        producto.setUser(propietario);
        producto = productoRepository.saveAndFlush(producto);

        item = new ItemLista();
        item.setCantidad(5);
        item.setTipoLista(TipoLista.DESPENSA);
        item.setUnidadMedida(UnidadMedida.L);
        item.setProducto(producto);
        item.setUser(propietario);
        item = itemListaRepository.saveAndFlush(item);
    }

    private User crearUsuario(String login) {
        User u = new User();
        u.setLogin(login);
        u.setPassword(RandomStringUtils.insecure().nextAlphanumeric(60));
        u.setActivated(true);
        u.setEmail(login + "@localhost");
        u.setLangKey("es");
        return userRepository.saveAndFlush(u);
    }

    private void limpiarCache() {
        em.flush();
        em.clear();
    }

    // ---------- Sin autenticar ----------

    @Test
    void sinAutenticarNoSePuedenListarProductos() throws Exception {
        mockMvc.perform(get("/api/productos")).andExpect(status().isUnauthorized());
    }

    @Test
    void sinAutenticarNoSePuedenListarItems() throws Exception {
        mockMvc.perform(get("/api/item-listas")).andExpect(status().isUnauthorized());
    }

    // ---------- Productos ----------

    @Test
    void elPropietarioPuedeLeerSuProducto() throws Exception {
        mockMvc
            .perform(get("/api/productos/{id}", producto.getId()).with(user(PROPIETARIO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nombre").value("leche"));
    }

    @Test
    void otroUsuarioNoVeProductosAjenosEnElListado() throws Exception {
        mockMvc
            .perform(get("/api/productos").with(user(INTRUSO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void otroUsuarioNoPuedeLeerUnProductoAjeno() throws Exception {
        mockMvc.perform(get("/api/productos/{id}", producto.getId()).with(user(INTRUSO))).andExpect(status().isNotFound());
    }

    @Test
    void otroUsuarioNoPuedeModificarUnProductoAjeno() throws Exception {
        mockMvc
            .perform(
                put("/api/productos/{id}", producto.getId()).with(user(INTRUSO)).contentType(MediaType.APPLICATION_JSON).content(PRODUCTO_JSON)
            )
            .andExpect(status().isNotFound());

        limpiarCache();
        Producto enBd = productoRepository.findById(producto.getId()).orElseThrow();
        assertThat(enBd.getNombre()).isEqualTo("leche");
        assertThat(enBd.getUser().getLogin()).isEqualTo(PROPIETARIO);
    }

    @Test
    void otroUsuarioNoPuedeBorrarUnProductoAjeno() throws Exception {
        mockMvc.perform(delete("/api/productos/{id}", producto.getId()).with(user(INTRUSO))).andExpect(status().isNotFound());

        limpiarCache();
        assertThat(productoRepository.findById(producto.getId())).isPresent();
    }

    @Test
    void elPropietarioPuedeModificarSuProducto() throws Exception {
        mockMvc
            .perform(
                put("/api/productos/{id}", producto.getId())
                    .with(user(PROPIETARIO))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(PRODUCTO_JSON)
            )
            .andExpect(status().isOk());

        limpiarCache();
        assertThat(productoRepository.findById(producto.getId()).orElseThrow().getNombre()).isEqualTo("modificado");
    }

    // ---------- Elementos de lista ----------

    @Test
    void elPropietarioPuedeSumarCantidadASuItem() throws Exception {
        mockMvc
            .perform(
                put("/api/item-listas/{id}/sumar", item.getId())
                    .with(user(PROPIETARIO))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"cantidad\":2}")
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.cantidad").value(7));
    }

    @Test
    void otroUsuarioNoPuedeLeerUnItemAjeno() throws Exception {
        mockMvc.perform(get("/api/item-listas/{id}", item.getId()).with(user(INTRUSO))).andExpect(status().isNotFound());
    }

    @Test
    void otroUsuarioNoVeItemsAjenosEnElListado() throws Exception {
        mockMvc
            .perform(get("/api/item-listas").with(user(INTRUSO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void otroUsuarioNoPuedeBorrarUnItemAjeno() throws Exception {
        mockMvc.perform(delete("/api/item-listas/{id}", item.getId()).with(user(INTRUSO))).andExpect(status().isNotFound());

        limpiarCache();
        assertThat(itemListaRepository.findById(item.getId())).isPresent();
    }

    @Test
    void otroUsuarioNoPuedeSumarNiRestarCantidadAUnItemAjeno() throws Exception {
        for (String accion : new String[] { "sumar", "restar" }) {
            mockMvc
                .perform(
                    put("/api/item-listas/{id}/" + accion, item.getId())
                        .with(user(INTRUSO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":2}")
                )
                .andExpect(status().isNotFound());
        }

        limpiarCache();
        assertThat(itemListaRepository.findById(item.getId()).orElseThrow().getCantidad()).isEqualTo(5);
    }

    @Test
    void otroUsuarioNoPuedeMoverUnItemAjenoEntreListas() throws Exception {
        for (String accion : new String[] { "pasar-a-compra", "comprar" }) {
            mockMvc
                .perform(
                    put("/api/item-listas/{id}/" + accion, item.getId())
                        .with(user(INTRUSO))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cantidad\":1}")
                )
                .andExpect(status().isNotFound());
        }

        limpiarCache();
        assertThat(itemListaRepository.findByUserLogin(PROPIETARIO)).hasSize(1);
        assertThat(itemListaRepository.findByUserLogin(INTRUSO)).isEmpty();
    }

    @Test
    void otroUsuarioNoPuedeModificarUnItemAjeno() throws Exception {
        mockMvc
            .perform(
                put("/api/item-listas/{id}", item.getId())
                    .with(user(INTRUSO))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"cantidad\":99,\"tipoLista\":\"DESPENSA\",\"unidadMedida\":\"L\",\"producto\":{\"id\":" + producto.getId() + "}}"
                    )
            )
            .andExpect(status().isNotFound());

        limpiarCache();
        assertThat(itemListaRepository.findById(item.getId()).orElseThrow().getCantidad()).isEqualTo(5);
    }

    @Test
    void otroUsuarioNoPuedeAnadirALaListaUnProductoAjeno() throws Exception {
        mockMvc
            .perform(
                post("/api/item-listas")
                    .with(user(INTRUSO))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"cantidad\":1,\"tipoLista\":\"COMPRA\",\"unidadMedida\":\"L\",\"producto\":{\"id\":" + producto.getId() + "}}"
                    )
            )
            .andExpect(status().isNotFound());

        limpiarCache();
        assertThat(itemListaRepository.findByUserLogin(INTRUSO)).isEmpty();
    }
}
