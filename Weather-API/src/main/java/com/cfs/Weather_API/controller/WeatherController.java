package com.cfs.Weather_API.controller;

import com.cfs.Weather_API.dto.WeatherForcastResponse;
import com.cfs.Weather_API.dto.WeatherResponse;
import com.cfs.Weather_API.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/weather")
@CrossOrigin
public class WeatherController {

    @Autowired
    WeatherService weatherService;

    @GetMapping
    public String getData(){
        return weatherService.test("London");
    }
    @GetMapping("/required/{city}")
    public WeatherResponse getrequire(@PathVariable String city){
        return weatherService.getWeather(city);
    }

    @GetMapping("/forcast")
    public WeatherForcastResponse getforcast(@RequestParam String city, int day)
    {
        System.out.println("City : "+city+"\nDay : "+day);
        return weatherService.getWeatherForcast(city, day);
    }

}
