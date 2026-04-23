package com.melit.listacompra.service;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.User;
import com.melit.listacompra.repository.ItemListaRepository;
import com.melit.listacompra.repository.UserRepository;
import com.melit.listacompra.security.SecurityUtils;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ItemListaService {

    private final ItemListaRepository itemListaRepository;
    private final UserRepository userRepository;

    public ItemListaService(ItemListaRepository itemListaRepository, UserRepository userRepository) {
        this.itemListaRepository = itemListaRepository;
        this.userRepository = userRepository;
    }

    public ItemLista save(ItemLista itemLista) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        itemLista.setUser(user);

        if (itemLista.getProducto() != null && itemLista.getProducto().getId() != null && itemLista.getTipoLista() != null) {
            Optional<ItemLista> existente = itemListaRepository.findByProductoIdAndTipoListaAndUserLogin(
                itemLista.getProducto().getId(),
                itemLista.getTipoLista(),
                login
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

    public List<ItemLista> findAll() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        return itemListaRepository.findByUserLogin(login);
    }

    public Optional<ItemLista> findOne(Long id) {
        return itemListaRepository.findById(id);
    }

    public void delete(Long id) {
        itemListaRepository.deleteById(id);
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

    public ItemLista sumarCantidad(Long id, Integer cantidadASumar) {
        ItemLista item = itemListaRepository.findById(id).orElseThrow(() -> new RuntimeException("ItemLista no encontrado con id: " + id));

        int cantidadActual = item.getCantidad() != null ? item.getCantidad() : 0;
        int suma = cantidadASumar != null ? cantidadASumar : 0;

        item.setCantidad(cantidadActual + suma);
        return itemListaRepository.save(item);
    }
}
