package com.melit.listacompra.service;

import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.domain.User;
import com.melit.listacompra.repository.ProductoRepository;
import com.melit.listacompra.repository.UserRepository;
import com.melit.listacompra.security.SecurityUtils;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final UserRepository userRepository;

    public ProductoService(ProductoRepository productoRepository, UserRepository userRepository) {
        this.productoRepository = productoRepository;
        this.userRepository = userRepository;
    }

    public Producto save(Producto producto) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        producto.setUser(user);
        return productoRepository.save(producto);
    }

    public List<Producto> findAll() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        return productoRepository.findByUserLogin(login);
    }

    public Optional<Producto> findOne(Long id) {
        return productoRepository.findById(id);
    }

    public void delete(Long id) {
        productoRepository.deleteById(id);
    }
}
