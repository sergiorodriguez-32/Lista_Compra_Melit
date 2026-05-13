package com.melit.listacompra.service;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.TipoLista;
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

    public void comprarItem(Long id, Integer cantidadAMover) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        ItemLista itemCompra = itemListaRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("ItemLista no encontrado con id: " + id));

        if (itemCompra.getProducto() == null || itemCompra.getProducto().getId() == null) {
            throw new RuntimeException("El item de compra no tiene producto válido");
        }

        int cantidadActual = itemCompra.getCantidad() != null ? itemCompra.getCantidad() : 0;
        int cantidadMover = cantidadAMover != null ? cantidadAMover : cantidadActual;

        if (cantidadMover <= 0) {
            throw new RuntimeException("La cantidad a mover debe ser mayor que 0");
        }

        if (cantidadMover > cantidadActual) {
            cantidadMover = cantidadActual;
        }

        Optional<ItemLista> itemDespensaExistente = itemListaRepository.findByProductoIdAndTipoListaAndUserLogin(
            itemCompra.getProducto().getId(),
            TipoLista.DESPENSA,
            login
        );

        if (itemDespensaExistente.isPresent()) {
            ItemLista itemDespensa = itemDespensaExistente.get();
            int cantidadDestino = itemDespensa.getCantidad() != null ? itemDespensa.getCantidad() : 0;

            itemDespensa.setCantidad(cantidadDestino + cantidadMover);
            if (itemCompra.getUnidadMedida() != null) {
                itemDespensa.setUnidadMedida(itemCompra.getUnidadMedida());
            }

            itemListaRepository.save(itemDespensa);
        } else {
            ItemLista nuevoItemDespensa = new ItemLista();
            nuevoItemDespensa.setCantidad(cantidadMover);
            nuevoItemDespensa.setUnidadMedida(itemCompra.getUnidadMedida());
            nuevoItemDespensa.setTipoLista(TipoLista.DESPENSA);
            nuevoItemDespensa.setProducto(itemCompra.getProducto());
            nuevoItemDespensa.setUser(itemCompra.getUser());

            itemListaRepository.save(nuevoItemDespensa);
        }

        int nuevaCantidadOrigen = cantidadActual - cantidadMover;

        if (nuevaCantidadOrigen <= 0) {
            itemListaRepository.deleteById(id);
        } else {
            itemCompra.setCantidad(nuevaCantidadOrigen);
            itemListaRepository.save(itemCompra);
        }
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

    public void pasarACompra(Long id, Integer cantidadAMover) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new RuntimeException("No hay usuario autenticado"));

        ItemLista itemDespensa = itemListaRepository
            .findById(id)
            .orElseThrow(() -> new RuntimeException("ItemLista no encontrado con id: " + id));

        if (itemDespensa.getProducto() == null || itemDespensa.getProducto().getId() == null) {
            throw new RuntimeException("El item de despensa no tiene producto válido");
        }

        int cantidadActual = itemDespensa.getCantidad() != null ? itemDespensa.getCantidad() : 0;
        int cantidadMover = cantidadAMover != null ? cantidadAMover : cantidadActual;

        if (cantidadMover <= 0) {
            throw new RuntimeException("La cantidad a mover debe ser mayor que 0");
        }

        if (cantidadMover > cantidadActual) {
            cantidadMover = cantidadActual;
        }

        Optional<ItemLista> itemCompraExistente = itemListaRepository.findByProductoIdAndTipoListaAndUserLogin(
            itemDespensa.getProducto().getId(),
            TipoLista.COMPRA,
            login
        );

        if (itemCompraExistente.isPresent()) {
            ItemLista itemCompra = itemCompraExistente.get();
            int cantidadDestino = itemCompra.getCantidad() != null ? itemCompra.getCantidad() : 0;

            itemCompra.setCantidad(cantidadDestino + cantidadMover);
            if (itemDespensa.getUnidadMedida() != null) {
                itemCompra.setUnidadMedida(itemDespensa.getUnidadMedida());
            }

            itemListaRepository.save(itemCompra);
        } else {
            ItemLista nuevoItemCompra = new ItemLista();
            nuevoItemCompra.setCantidad(cantidadMover);
            nuevoItemCompra.setUnidadMedida(itemDespensa.getUnidadMedida());
            nuevoItemCompra.setTipoLista(TipoLista.COMPRA);
            nuevoItemCompra.setProducto(itemDespensa.getProducto());
            nuevoItemCompra.setUser(itemDespensa.getUser());

            itemListaRepository.save(nuevoItemCompra);
        }

        int nuevaCantidadOrigen = cantidadActual - cantidadMover;

        if (nuevaCantidadOrigen <= 0) {
            itemListaRepository.deleteById(id);
        } else {
            itemDespensa.setCantidad(nuevaCantidadOrigen);
            itemListaRepository.save(itemDespensa);
        }
    }
}
