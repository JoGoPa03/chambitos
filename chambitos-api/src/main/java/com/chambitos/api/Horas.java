package com.chambitos.api;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;

public class Horas {

    public static int minutos(String hora) {
        String[] partes = hora.split(":");
        return Integer.parseInt(partes[0]) * 60 + Integer.parseInt(partes[1]);
    }

    public static String hora(int minutos) {
        return String.format("%02d:%02d", (minutos / 60) % 24, minutos % 60);
    }

    public static String tipoDia(String fecha) {
        DayOfWeek dia = LocalDate.parse(fecha).getDayOfWeek();
        if (dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY) {
            return "F";
        }
        return "L";
    }

    public static boolean yaHaSalido(String fecha, String hora) {
        LocalDate hoy = LocalDate.now(ZoneId.of("Europe/Madrid"));
        LocalDate dia = LocalDate.parse(fecha);
        if (dia.isBefore(hoy)) {
            return true;
        }
        if (dia.isAfter(hoy)) {
            return false;
        }
        return LocalTime.parse(hora).isBefore(LocalTime.now(ZoneId.of("Europe/Madrid")));
    }

    public static double precio(com.chambitos.api.modelo.Viaje v, int i, int j) {
        if (v.getPrecio() != null) {
            return v.getPrecio();
        }
        return precio(i, j);
    }

    public static String proximaFecha(String dias) {
        LocalDate d = LocalDate.now(ZoneId.of("Europe/Madrid")).plusDays(1);
        while (!tipoDia(d.toString()).equals(dias)) {
            d = d.plusDays(1);
        }
        return d.toString();
    }

    public static double precio(int i, int j) {
        return Math.round((1.2 + 0.35 * (j - i)) * 100) / 100.0;
    }
}
