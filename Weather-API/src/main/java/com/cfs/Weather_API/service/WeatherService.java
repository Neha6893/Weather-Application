package com.cfs.Weather_API.service;

import com.cfs.Weather_API.data_class.Forecastday;
import com.cfs.Weather_API.data_class.Root;
import com.cfs.Weather_API.dto.DayInfo;
import com.cfs.Weather_API.dto.WeatherForcastResponse;
import com.cfs.Weather_API.dto.WeatherResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    @Value("${weather.api.forecast.url}")
    private String apiForecastUrl;

    private RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private WeatherResponse weatherResponse;

    public String test(String city){
        return "good";
    }

    public WeatherResponse getWeather(String city){
        String url = apiUrl + "?key=" + apiKey + "&q=" + city;
        System.out.println(url);
        Root response = restTemplate.getForObject(url, Root.class);
        weatherResponse.setCityname(response.getLocation().getName());
        weatherResponse.setRegion(response.getLocation().getRegion());
        weatherResponse.setContry(response.getLocation().getCountry());
        weatherResponse.setCondition(response.getCurrent().getCondition().getText());
        weatherResponse.setTemp(response.getCurrent().getTemp_c());
        return weatherResponse;
    }

    public WeatherForcastResponse getWeatherForcast(String city,int day){

        WeatherForcastResponse forcast = new WeatherForcastResponse();

        WeatherResponse wr =  getWeather(city);
        forcast.setWeatherResponse(wr);

        String url = apiForecastUrl + "?key=" + apiKey + "&q=" + city +"&days="+day;
        System.out.println(url);

        Root response = restTemplate.getForObject(url, Root.class);

        List<Forecastday> fd = response.getForecast().forecastday;
        List<DayInfo> dayInfoList = new ArrayList<>();
        for (Forecastday one : fd){
            DayInfo di = new DayInfo();
            di.setDate(one.getDate());
            di.setAvgTemp(one.getDay().getAvgtemp_c());
            di.setMaxTemp(one.getDay().getMaxtemp_c());
            di.setMinTemp(one.getDay().getMintemp_c());

            dayInfoList.add(di);
        }
        forcast.setDay(dayInfoList);

        return forcast;
    }
}


