package Code.Project.HospitalSelectioSystem.service;

import Code.Project.HospitalSelectioSystem.model.Hospital;
import Code.Project.HospitalSelectioSystem.repository.HospitalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HospitalService {

    @Autowired
    private HospitalRepository hospitalRepository;

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Hospital getHospitalById(Long id) {
        return hospitalRepository.findById(id).orElse(null);
    }

    public List<String> getCities() {
        return hospitalRepository.findDistinctCities();
    }

    public List<Hospital> getByCity(String city) {
        return hospitalRepository.findByCityIgnoreCaseOrderByNameAsc(city);
    }

    public List<Hospital> getByCityAndArea(String city, String area) {
        return hospitalRepository.findByCityIgnoreCaseAndAreaIgnoreCaseOrderByNameAsc(city, area);
    }

    public List<Hospital> getTopInCity(String city) {
        return hospitalRepository.findTop3ByCityIgnoreCaseOrderByNameAsc(city);
    }

    public List<Hospital> getSuggestions(String keyword) {
        return hospitalRepository.findTop5ByNameContainingIgnoreCaseOrAreaContainingIgnoreCaseOrCityContainingIgnoreCase(keyword, keyword, keyword);
    }

    public List<Hospital> searchHospitals(String keyword) {
        return hospitalRepository.findByNameContainingIgnoreCaseOrAreaContainingIgnoreCase(keyword, keyword);
    }

    public Hospital addHospital(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    public Hospital updateHospitalPartially(Long id, Hospital hospitalData) {
        Hospital hospital = hospitalRepository.findById(id).orElse(null);
        if (hospital != null) {
            hospital.setTotalBeds(hospitalData.getTotalBeds());
            hospital.setAvailableBeds(hospitalData.getAvailableBeds());
            hospital.setAvailableDoctors(hospitalData.getAvailableDoctors());
            hospital.setOxygenAvailable(hospitalData.isOxygenAvailable());
            hospital.setVentilatorAvailable(hospitalData.isVentilatorAvailable());
            hospital.setAmbulanceAvailable(hospitalData.isAmbulanceAvailable());
            hospital.setOpen24Hours(hospitalData.isOpen24Hours());

            return hospitalRepository.save(hospital);
        }
        return null;
    }

    public Hospital updateHospital(Long id, Hospital hospitalData) {
        Hospital hospital = hospitalRepository.findById(id).orElse(null);
        if (hospital != null) {
            hospital.setName(hospitalData.getName());
            hospital.setArea(hospitalData.getArea());
            hospital.setAddress(hospitalData.getAddress());
            hospital.setContactno(hospitalData.getContactno());
            hospital.setTotalBeds(hospitalData.getTotalBeds());
            hospital.setOpen24Hours(hospitalData.isOpen24Hours());
            hospital.setAvailableBeds(hospitalData.getAvailableBeds());
            hospital.setAvailableDoctors(hospitalData.getAvailableDoctors());
            hospital.setAmbulanceAvailable(hospitalData.isAmbulanceAvailable());
            hospital.setOxygenAvailable(hospitalData.isOxygenAvailable());
            hospital.setVentilatorAvailable(hospitalData.isVentilatorAvailable());

            return hospitalRepository.save(hospital);
        }
        return null;
    }

    public void deleteHospital(Long id) {
        hospitalRepository.deleteById(id);
    }

}
