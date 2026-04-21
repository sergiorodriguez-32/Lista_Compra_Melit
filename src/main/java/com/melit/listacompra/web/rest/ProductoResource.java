package com.melit.listacompra.web.rest;

import com.melit.listacompra.domain.Producto;
import com.melit.listacompra.service.ProductoService;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoResource {

    private final ProductoService productoService;

    public ProductoResource(ProductoService productoService) {
        this.productoService = productoService;
    }

    @PostMapping
    public ResponseEntity<Producto> createProducto(@RequestBody Producto producto) throws URISyntaxException {
        Producto result = productoService.save(producto);
        return ResponseEntity.created(new URI("/api/productos/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> updateProducto(@PathVariable Long id, @RequestBody Producto producto) {
        producto.setId(id);
        Producto result = productoService.save(producto);
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public List<Producto> getAllProductos() {
        return productoService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getProducto(@PathVariable Long id) {
        Optional<Producto> producto = productoService.findOne(id);
        return producto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProducto(@PathVariable Long id) {
        productoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
