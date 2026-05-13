package com.melit.listacompra.web.rest;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.service.ItemListaService;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/item-listas")
public class ItemListaResource {

    private final ItemListaService itemListaService;

    public ItemListaResource(ItemListaService itemListaService) {
        this.itemListaService = itemListaService;
    }

    @PostMapping
    public ResponseEntity<ItemLista> createItemLista(@RequestBody ItemLista itemLista) throws URISyntaxException {
        ItemLista result = itemListaService.save(itemLista);
        return ResponseEntity.created(new URI("/api/item-listas/" + result.getId())).body(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ItemLista> updateItemLista(@PathVariable Long id, @RequestBody ItemLista itemLista) {
        itemLista.setId(id);
        ItemLista result = itemListaService.save(itemLista);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/comprar")
    public ResponseEntity<Void> comprarItem(@PathVariable Long id, @RequestBody(required = false) RestarCantidadRequest request) {
        Integer cantidad = request != null ? request.getCantidad() : null;
        itemListaService.comprarItem(id, cantidad);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<ItemLista> getAllItemListas() {
        return itemListaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ItemLista> getItemLista(@PathVariable Long id) {
        Optional<ItemLista> itemLista = itemListaService.findOne(id);
        return itemLista.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItemLista(@PathVariable Long id) {
        itemListaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/restar")
    public ResponseEntity<ItemLista> restarCantidad(@PathVariable Long id, @RequestBody RestarCantidadRequest request) {
        ItemLista result = itemListaService.restarCantidad(id, request.getCantidad());

        if (result == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/sumar")
    public ResponseEntity<ItemLista> sumarCantidad(@PathVariable Long id, @RequestBody RestarCantidadRequest request) {
        ItemLista result = itemListaService.sumarCantidad(id, request.getCantidad());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/pasar-a-compra")
    public ResponseEntity<Void> pasarACompra(@PathVariable Long id, @RequestBody(required = false) RestarCantidadRequest request) {
        Integer cantidad = request != null ? request.getCantidad() : null;
        itemListaService.pasarACompra(id, cantidad);
        return ResponseEntity.ok().build();
    }
}
