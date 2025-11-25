package Code.Project.HospitalSelectioSystem.controller;

import Code.Project.HospitalSelectioSystem.model.Hospital;
import Code.Project.HospitalSelectioSystem.service.FeedbackService;
import Code.Project.HospitalSelectioSystem.service.HospitalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
@CrossOrigin(origins = "*")
public class HospitalController {
    @Autowired
    private HospitalService hospitalService;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    public List<Hospital> getAllHospitals() {
        return hospitalService.getAllHospitals();
    }

    @GetMapping("/{id}")
    public Hospital getHospitalById(@PathVariable Long id) {
        return hospitalService.getHospitalById(id);
    }

    @GetMapping("/cities")
    public List<String> getCities() {
        return hospitalService.getCities();
    }

    @GetMapping("/city/{city}")
    public List<Hospital> getByCity(@PathVariable String city) {
        return hospitalService.getByCity(city);
    }

    @GetMapping("/city/{city}/area/{area}")
    public List<Hospital> getByCityAndArea(@PathVariable String city, @PathVariable String area) {
        return hospitalService.getByCityAndArea(city, area);
    }

    @GetMapping("/top/{city}")
    public List<Hospital> getTopByCity(@PathVariable String city) {
        return hospitalService.getTopInCity(city);
    }

    @GetMapping("/search/{keyword}")
    public List<Hospital> searchHospitals(@PathVariable String keyword) {
        return hospitalService.searchHospitals(keyword);
    }

    @GetMapping("/suggestions/{keyword}")
    public List<Hospital> getSuggestions(@PathVariable String keyword) {
        return hospitalService.getSuggestions(keyword);
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<Double> getHospitalRating(@PathVariable Long id) {
        Double avgRating = feedbackService.getAverageRatingByHospital(id);
        return ResponseEntity.ok(avgRating);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Hospital updateHospital(@PathVariable Long id, @RequestBody Hospital updated) {
        return hospitalService.updateHospital(id, updated);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Hospital createHospital(@RequestBody Hospital hospital) {
        return hospitalService.addHospital(hospital);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('STAFF')")
    public Hospital updateHospitalPartially(@PathVariable Long id, @RequestBody Hospital updates) {
        return hospitalService.updateHospitalPartially(id, updates);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteHospital(@PathVariable Long id) {
        hospitalService.deleteHospital(id);
    }

}

