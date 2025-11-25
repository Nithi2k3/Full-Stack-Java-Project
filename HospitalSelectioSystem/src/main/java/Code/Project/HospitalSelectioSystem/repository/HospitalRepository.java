package Code.Project.HospitalSelectioSystem.repository;

import Code.Project.HospitalSelectioSystem.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    List<Hospital> findByNameContainingIgnoreCaseOrAreaContainingIgnoreCase(
            String name, String area
    );

    List<Hospital> findTop5ByNameContainingIgnoreCaseOrAreaContainingIgnoreCaseOrCityContainingIgnoreCase(
            String name, String area, String city
    );

    List<Hospital> findByCityIgnoreCaseOrderByNameAsc(String city);

    List<Hospital> findByCityIgnoreCaseAndAreaIgnoreCaseOrderByNameAsc(
            String city, String area
    );

    List<Hospital> findTop3ByCityIgnoreCaseOrderByNameAsc(String city);

    @Query("SELECT DISTINCT h.city FROM Hospital h WHERE h.city IS NOT NULL ORDER BY h.city ASC")
    List<String> findDistinctCities();

}
