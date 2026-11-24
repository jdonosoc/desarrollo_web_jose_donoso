package com.tarea4.tarea4.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AppController {

    @GetMapping("/")
    public String indexRoute() {
        return "index";
    }
}
