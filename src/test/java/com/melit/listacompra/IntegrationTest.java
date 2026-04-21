package com.melit.listacompra;

import com.melit.listacompra.config.AsyncSyncConfiguration;
import com.melit.listacompra.config.EmbeddedSQL;
import com.melit.listacompra.config.JacksonConfiguration;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Base composite annotation for integration tests.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest(
    classes = {
        MelitMarketApp.class,
        JacksonConfiguration.class,
        AsyncSyncConfiguration.class,
        com.melit.listacompra.config.JacksonHibernateConfiguration.class,
    }
)
@EmbeddedSQL
public @interface IntegrationTest {}
