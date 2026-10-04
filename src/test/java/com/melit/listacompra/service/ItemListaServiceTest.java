package com.melit.listacompra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.domain.TipoLista;
import com.melit.listacompra.domain.UnidadMedida;
import com.melit.listacompra.domain.User;
import com.melit.listacompra.repository.ItemListaRepository;
import com.melit.listacompra.repository.ProductoRepository;
import com.melit.listacompra.repository.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

/**
 * Tests unitarios de la logica de {@link ItemListaService}: anadir, sumar, restar y mover cantidades
 * entre la despensa y la lista de compra. Los repositorios se simulan con Mockito.
 */
@ExtendWith(MockitoExtension.class)
class ItemListaServiceTest {

    private static final String LOGIN = "usuarioa";
    private static final Long ITEM_ID = 1L;
    private static final Long PRODUCTO_ID = 10L;

    @Mock
    private ItemListaRepository itemListaRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private UserRepository userRepository;

    private ItemListaService service;
    private User usuario;
    private Producto producto;

    @BeforeEach
    void initTest() {
        service = new ItemListaService(itemListaRepository, productoRepository, userRepository);

        usuario = new User();
        usuario.setLogin(LOGIN);

        producto = new Producto();
        producto.setId(PRODUCTO_ID);
        producto.setUser(usuario);

        autenticarComo(LOGIN);
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    private void autenticarComo(String login) {
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(new UsernamePasswordAuthenticationToken(login, "password"));
        SecurityContextHolder.setContext(context);
    }

    private ItemLista crearItem(Long id, int cantidad, TipoLista tipo) {
        ItemLista item = new ItemLista();
        item.setId(id);
        item.setCantidad(cantidad);
        item.setTipoLista(tipo);
        item.setUnidadMedida(UnidadMedida.UNIDAD);
        item.setProducto(producto);
        item.setUser(usuario);
        return item;
    }

    /** Hace que el item exista y sea del usuario autenticado. */
    private void dadoQueExiste(ItemLista item) {
        when(itemListaRepository.findByIdAndUserLogin(item.getId(), LOGIN)).thenReturn(Optional.of(item));
    }

    /** Configura si el producto ya esta en la lista de destino (y con que item). */
    private void dadoQueEnLaListaYaEsta(TipoLista tipo, Optional<ItemLista> existente) {
        when(itemListaRepository.findByProductoIdAndTipoListaAndUserLogin(PRODUCTO_ID, tipo, LOGIN)).thenReturn(existente);
    }

    private void assertNotFound(Runnable accion) {
        assertThatThrownBy(accion::run)
            .isInstanceOf(ResponseStatusException.class)
            .extracting(e -> ((ResponseStatusException) e).getStatusCode())
            .isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ---------- save: anadir a una lista ----------

    @Test
    void anadirUnProductoNuevoALaListaLoGuardaConElUsuarioActual() {
        ItemLista nuevo = crearItem(null, 3, TipoLista.COMPRA);
        nuevo.setUser(null);
        when(userRepository.findOneByLogin(LOGIN)).thenReturn(Optional.of(usuario));
        when(productoRepository.findByIdAndUserLogin(PRODUCTO_ID, LOGIN)).thenReturn(Optional.of(producto));
        dadoQueEnLaListaYaEsta(TipoLista.COMPRA, Optional.empty());
        when(itemListaRepository.save(any(ItemLista.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemLista resultado = service.save(nuevo);

        assertThat(resultado.getCantidad()).isEqualTo(3);
        assertThat(resultado.getUser()).isSameAs(usuario);
        verify(itemListaRepository).save(nuevo);
    }

    @Test
    void anadirUnProductoQueYaEstaEnLaListaSumaLaCantidadSinDuplicar() {
        ItemLista existente = crearItem(ITEM_ID, 2, TipoLista.COMPRA);
        ItemLista nuevo = crearItem(null, 3, TipoLista.COMPRA);
        nuevo.setUnidadMedida(UnidadMedida.KG);
        when(userRepository.findOneByLogin(LOGIN)).thenReturn(Optional.of(usuario));
        when(productoRepository.findByIdAndUserLogin(PRODUCTO_ID, LOGIN)).thenReturn(Optional.of(producto));
        dadoQueEnLaListaYaEsta(TipoLista.COMPRA, Optional.of(existente));
        when(itemListaRepository.save(any(ItemLista.class))).thenAnswer(inv -> inv.getArgument(0));

        ItemLista resultado = service.save(nuevo);

        assertThat(resultado).isSameAs(existente);
        assertThat(resultado.getCantidad()).isEqualTo(5);
        assertThat(resultado.getUnidadMedida()).isEqualTo(UnidadMedida.KG);
        verify(itemListaRepository, never()).save(nuevo);
    }

    @Test
    void anadirUnProductoAjenoDaNotFoundYNoGuardaNada() {
        ItemLista nuevo = crearItem(null, 1, TipoLista.COMPRA);
        when(userRepository.findOneByLogin(LOGIN)).thenReturn(Optional.of(usuario));
        when(productoRepository.findByIdAndUserLogin(PRODUCTO_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.save(nuevo));

        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    @Test
    void modificarUnItemAjenoDaNotFoundYNoGuardaNada() {
        ItemLista ajeno = crearItem(ITEM_ID, 1, TipoLista.COMPRA);
        when(userRepository.findOneByLogin(LOGIN)).thenReturn(Optional.of(usuario));
        when(itemListaRepository.findByIdAndUserLogin(ITEM_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.save(ajeno));

        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    @Test
    void sinUsuarioAutenticadoNoSePuedeGuardar() {
        SecurityContextHolder.clearContext();

        assertThatThrownBy(() -> service.save(crearItem(null, 1, TipoLista.COMPRA)))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("No hay usuario autenticado");

        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    // ---------- sumar y restar ----------

    @Test
    void sumarCantidadIncrementaLaCantidadDelItem() {
        ItemLista item = crearItem(ITEM_ID, 4, TipoLista.DESPENSA);
        dadoQueExiste(item);
        when(itemListaRepository.save(item)).thenReturn(item);

        ItemLista resultado = service.sumarCantidad(ITEM_ID, 3);

        assertThat(resultado.getCantidad()).isEqualTo(7);
    }

    @Test
    void restarCantidadReduceLaCantidadDelItem() {
        ItemLista item = crearItem(ITEM_ID, 4, TipoLista.DESPENSA);
        dadoQueExiste(item);
        when(itemListaRepository.save(item)).thenReturn(item);

        ItemLista resultado = service.restarCantidad(ITEM_ID, 1);

        assertThat(resultado.getCantidad()).isEqualTo(3);
        verify(itemListaRepository, never()).deleteById(ITEM_ID);
    }

    @Test
    void restarTodaLaCantidadEliminaElItemYDevuelveNull() {
        ItemLista item = crearItem(ITEM_ID, 4, TipoLista.DESPENSA);
        dadoQueExiste(item);

        ItemLista resultado = service.restarCantidad(ITEM_ID, 4);

        assertThat(resultado).isNull();
        verify(itemListaRepository).deleteById(ITEM_ID);
        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    @Test
    void restarMasDeLoQueHayEliminaElItem() {
        ItemLista item = crearItem(ITEM_ID, 2, TipoLista.DESPENSA);
        dadoQueExiste(item);

        ItemLista resultado = service.restarCantidad(ITEM_ID, 10);

        assertThat(resultado).isNull();
        verify(itemListaRepository).deleteById(ITEM_ID);
    }

    @Test
    void sumarORestarSobreUnItemAjenoDaNotFound() {
        when(itemListaRepository.findByIdAndUserLogin(ITEM_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.sumarCantidad(ITEM_ID, 1));
        assertNotFound(() -> service.restarCantidad(ITEM_ID, 1));

        verify(itemListaRepository, never()).save(any(ItemLista.class));
        verify(itemListaRepository, never()).deleteById(any());
    }

    // ---------- comprar: compra -> despensa ----------

    @Test
    void comprarTodoSinCantidadMueveTodoALaDespensaYBorraElItemDeCompra() {
        ItemLista compra = crearItem(ITEM_ID, 5, TipoLista.COMPRA);
        dadoQueExiste(compra);
        dadoQueEnLaListaYaEsta(TipoLista.DESPENSA, Optional.empty());

        service.comprarItem(ITEM_ID, null);

        ArgumentCaptor<ItemLista> guardado = ArgumentCaptor.forClass(ItemLista.class);
        verify(itemListaRepository).save(guardado.capture());
        assertThat(guardado.getValue().getTipoLista()).isEqualTo(TipoLista.DESPENSA);
        assertThat(guardado.getValue().getCantidad()).isEqualTo(5);
        assertThat(guardado.getValue().getProducto()).isSameAs(producto);
        verify(itemListaRepository).deleteById(ITEM_ID);
    }

    @Test
    void comprarUnaParteDejaElRestoEnLaListaDeCompra() {
        ItemLista compra = crearItem(ITEM_ID, 5, TipoLista.COMPRA);
        dadoQueExiste(compra);
        dadoQueEnLaListaYaEsta(TipoLista.DESPENSA, Optional.empty());

        service.comprarItem(ITEM_ID, 2);

        ArgumentCaptor<ItemLista> guardados = ArgumentCaptor.forClass(ItemLista.class);
        verify(itemListaRepository, times(2)).save(guardados.capture());
        List<ItemLista> items = guardados.getAllValues();
        ItemLista enDespensa = items.stream().filter(i -> i.getTipoLista() == TipoLista.DESPENSA).findFirst().orElseThrow();
        ItemLista enCompra = items.stream().filter(i -> i.getTipoLista() == TipoLista.COMPRA).findFirst().orElseThrow();
        assertThat(enDespensa.getCantidad()).isEqualTo(2);
        assertThat(enCompra.getCantidad()).isEqualTo(3);
        verify(itemListaRepository, never()).deleteById(ITEM_ID);
    }

    @Test
    void comprarSumaALaCantidadQueYaHabiaEnLaDespensa() {
        ItemLista compra = crearItem(ITEM_ID, 5, TipoLista.COMPRA);
        ItemLista enDespensa = crearItem(2L, 4, TipoLista.DESPENSA);
        dadoQueExiste(compra);
        dadoQueEnLaListaYaEsta(TipoLista.DESPENSA, Optional.of(enDespensa));

        service.comprarItem(ITEM_ID, 3);

        assertThat(enDespensa.getCantidad()).isEqualTo(7);
        assertThat(compra.getCantidad()).isEqualTo(2);
        verify(itemListaRepository).save(enDespensa);
        verify(itemListaRepository).save(compra);
    }

    @Test
    void comprarMasDeLoQueHayMueveSoloLoQueHayYBorraElOrigen() {
        ItemLista compra = crearItem(ITEM_ID, 5, TipoLista.COMPRA);
        ItemLista enDespensa = crearItem(2L, 1, TipoLista.DESPENSA);
        dadoQueExiste(compra);
        dadoQueEnLaListaYaEsta(TipoLista.DESPENSA, Optional.of(enDespensa));

        service.comprarItem(ITEM_ID, 99);

        assertThat(enDespensa.getCantidad()).isEqualTo(6);
        verify(itemListaRepository).deleteById(ITEM_ID);
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, -3 })
    void comprarUnaCantidadNoPositivaLanzaErrorYNoCambiaNada(int cantidad) {
        ItemLista compra = crearItem(ITEM_ID, 5, TipoLista.COMPRA);
        dadoQueExiste(compra);

        assertThatThrownBy(() -> service.comprarItem(ITEM_ID, cantidad))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("La cantidad a mover debe ser mayor que 0");

        verify(itemListaRepository, never()).save(any(ItemLista.class));
        verify(itemListaRepository, never()).deleteById(any());
    }

    @Test
    void comprarUnItemAjenoDaNotFound() {
        when(itemListaRepository.findByIdAndUserLogin(ITEM_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.comprarItem(ITEM_ID, 1));

        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    // ---------- pasar a compra: despensa -> compra ----------

    @Test
    void pasarTodoACompraMueveTodoYBorraElItemDeDespensa() {
        ItemLista despensa = crearItem(ITEM_ID, 6, TipoLista.DESPENSA);
        dadoQueExiste(despensa);
        dadoQueEnLaListaYaEsta(TipoLista.COMPRA, Optional.empty());

        service.pasarACompra(ITEM_ID, null);

        ArgumentCaptor<ItemLista> guardado = ArgumentCaptor.forClass(ItemLista.class);
        verify(itemListaRepository).save(guardado.capture());
        assertThat(guardado.getValue().getTipoLista()).isEqualTo(TipoLista.COMPRA);
        assertThat(guardado.getValue().getCantidad()).isEqualTo(6);
        verify(itemListaRepository).deleteById(ITEM_ID);
    }

    @Test
    void pasarUnaParteACompraSumaALoQueYaHabiaYDejaElRestoEnDespensa() {
        ItemLista despensa = crearItem(ITEM_ID, 6, TipoLista.DESPENSA);
        ItemLista enCompra = crearItem(2L, 1, TipoLista.COMPRA);
        dadoQueExiste(despensa);
        dadoQueEnLaListaYaEsta(TipoLista.COMPRA, Optional.of(enCompra));

        service.pasarACompra(ITEM_ID, 2);

        assertThat(enCompra.getCantidad()).isEqualTo(3);
        assertThat(despensa.getCantidad()).isEqualTo(4);
        verify(itemListaRepository, never()).deleteById(ITEM_ID);
    }

    @ParameterizedTest
    @ValueSource(ints = { 0, -1 })
    void pasarACompraUnaCantidadNoPositivaLanzaErrorYNoCambiaNada(int cantidad) {
        ItemLista despensa = crearItem(ITEM_ID, 6, TipoLista.DESPENSA);
        dadoQueExiste(despensa);

        assertThatThrownBy(() -> service.pasarACompra(ITEM_ID, cantidad)).isInstanceOf(RuntimeException.class);

        verify(itemListaRepository, never()).save(any(ItemLista.class));
        verify(itemListaRepository, never()).deleteById(any());
    }

    @Test
    void pasarACompraUnItemAjenoDaNotFound() {
        when(itemListaRepository.findByIdAndUserLogin(ITEM_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.pasarACompra(ITEM_ID, 1));

        verify(itemListaRepository, never()).save(any(ItemLista.class));
    }

    // ---------- consultas y borrado ----------

    @Test
    void findAllSoloDevuelveLosItemsDelUsuarioActual() {
        ItemLista item = crearItem(ITEM_ID, 1, TipoLista.COMPRA);
        when(itemListaRepository.findByUserLogin(LOGIN)).thenReturn(List.of(item));

        assertThat(service.findAll()).containsExactly(item);
    }

    @Test
    void borrarUnItemPropioLoElimina() {
        ItemLista item = crearItem(ITEM_ID, 1, TipoLista.COMPRA);
        dadoQueExiste(item);

        service.delete(ITEM_ID);

        verify(itemListaRepository).delete(item);
    }

    @Test
    void borrarUnItemAjenoDaNotFoundYNoBorraNada() {
        when(itemListaRepository.findByIdAndUserLogin(ITEM_ID, LOGIN)).thenReturn(Optional.empty());

        assertNotFound(() -> service.delete(ITEM_ID));

        verify(itemListaRepository, never()).delete(any(ItemLista.class));
    }
}
