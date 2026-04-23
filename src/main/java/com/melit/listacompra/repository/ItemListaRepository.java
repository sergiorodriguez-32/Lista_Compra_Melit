package com.melit.listacompra.repository;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.TipoLista;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemListaRepository extends JpaRepository<ItemLista, Long> {
    Optional<ItemLista> findByProductoIdAndTipoListaAndUserLogin(Long productoId, TipoLista tipoLista, String login);

    List<ItemLista> findByUserLogin(String login);
}
