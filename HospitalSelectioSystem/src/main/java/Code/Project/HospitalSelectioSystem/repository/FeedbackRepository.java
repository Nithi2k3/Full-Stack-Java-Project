package Code.Project.HospitalSelectioSystem.repository;

import Code.Project.HospitalSelectioSystem.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByHospitalId(Long hospitalId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.hospitalId = :hospitalId")
    Double findAverageRatingByHospitalId(@Param("hospitalId") Long hospitalId);
}

