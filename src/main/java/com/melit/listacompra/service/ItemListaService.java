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
        return itemListaRepository.save(itemLista);
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
