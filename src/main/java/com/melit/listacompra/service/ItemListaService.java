package com.melit.listacompra.service;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.repository.ItemListaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ItemListaService {

    private final ItemListaRepository itemListaRepository;

    public ItemListaService(ItemListaRepository itemListaRepository) {
        this.itemListaRepository = itemListaRepository;
    }

    public ItemLista save(ItemLista itemLista) {
        if (itemLista.getProducto() != null && itemLista.getProducto().getId() != null && itemLista.getTipoLista() != null) {
            Optional<ItemLista> existente = itemListaRepository.findByProductoIdAndTipoLista(
                itemLista.getProducto().getId(),
                itemLista.getTipoLista()
            );

            if (existente.isPresent()) {
                ItemLista itemExistente = existente.get();
                int cantidadActual = itemExistente.getCantidad() != null ? itemExistente.getCantidad() : 0;
                int cantidadNueva = itemLista.getCantidad() != null ? itemLista.getCantidad() : 0;

                itemExistente.setCantidad(cantidadActual + cantidadNueva);

                if (itemLista.getUnidadMedida() != null) {
                    itemExistente.setUnidadMedida(itemLista.getUnidadMedida());
                }

                return itemListaRepository.save(itemExistente);
            }
        }

        return itemListaRepository.save(itemLista);
    }

    public ItemLista restarCantidad(Long id, Integer cantidadARestar) {
        ItemLista item = itemListaRepository.findById(id).orElseThrow(() -> new RuntimeException("ItemLista no encontrado con id: " + id));

        int cantidadActual = item.getCantidad() != null ? item.getCantidad() : 0;
        int resta = cantidadARestar != null ? cantidadARestar : 0;
        int nuevaCantidad = cantidadActual - resta;

        if (nuevaCantidad <= 0) {
            itemListaRepository.deleteById(id);
            return null;
        }

        item.setCantidad(nuevaCantidad);
        return itemListaRepository.save(item);
    }

    public List<ItemLista> findAll() {
        return itemListaRepository.findAll();
    }

    public Optional<ItemLista> findOne(Long id) {
        return itemListaRepository.findById(id);
    }

    public void delete(Long id) {
        itemListaRepository.deleteById(id);
    }
}
