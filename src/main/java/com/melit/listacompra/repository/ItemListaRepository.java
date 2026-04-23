package com.melit.listacompra.repository;

import com.melit.listacompra.domain.ItemLista;
import com.melit.listacompra.domain.TipoLista;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemListaRepository extends JpaRepository<ItemLista, Long> {
    Optional<ItemLista> findByProductoIdAndTipoLista(Long productoId, TipoLista tipoLista);
}
