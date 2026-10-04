package com.melit.listacompra.service;

import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.domain.User;
import com.melit.listacompra.repository.ProductoRepository;
import com.melit.listacompra.repository.UserRepository;
import com.melit.listacompra.security.SecurityUtils;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final UserRepository userRepository;

    public ProductoService(ProductoRepository productoRepository, UserRepository userRepository) {
        this.productoRepository = productoRepository;
        this.userRepository = userRepository;
    }

    public Producto save(Producto producto) {
        String login = loginActual();

        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Si llega un id, solo se puede modificar un producto que ya sea del usuario autenticado
        if (producto.getId() != null) {
            buscarPropio(producto.getId(), login);
        }

        producto.setUser(user);
        return productoRepository.save(producto);
    }

    public List<Producto> findAll() {
        return productoRepository.findByUserLogin(loginActual());
    }

    public Optional<Producto> findOne(Long id) {
        return productoRepository.findByIdAndUserLogin(id, loginActual());
    }

    public void delete(Long id) {
        Producto producto = buscarPropio(id, loginActual());
        productoRepository.delete(producto);
    }

    private String loginActual() {
        return SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));
    }

    // Un producto de otro usuario se trata igual que uno inexistente (404), para no revelar que existe
    private Producto buscarPropio(Long id, String login) {
        return productoRepository
            .findByIdAndUserLogin(id, login)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado con id: " + id));
    }
}
