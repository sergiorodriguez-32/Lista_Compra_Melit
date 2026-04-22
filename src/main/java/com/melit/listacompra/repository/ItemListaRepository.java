package com.melit.listacompra.repository;

import com.melit.listacompra.domain.ItemLista;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ItemListaRepository extends JpaRepository<ItemLista, Long> {}
