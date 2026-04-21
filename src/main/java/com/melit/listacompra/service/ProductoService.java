package com.melit.listacompra.service;

import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.repository.ProductoRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ProductoService {

    private final ProductoRepository productoRepository;

    public ProductoService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    public Producto save(Producto producto) {
        return productoRepository.save(producto);
    }

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Optional<Producto> findOne(Long id) {
        return productoRepository.findById(id);
    }

    public void delete(Long id) {
        productoRepository.deleteById(id);
    }
}
