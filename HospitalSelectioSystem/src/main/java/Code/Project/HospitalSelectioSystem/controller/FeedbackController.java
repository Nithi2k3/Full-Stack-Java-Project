package Code.Project.HospitalSelectioSystem.controller;

import Code.Project.HospitalSelectioSystem.model.Feedback;
import Code.Project.HospitalSelectioSystem.service.FeedbackService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/feedback")
public class FeedbackController {
    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping
    public Feedback addFeedback(@RequestBody Feedback feedback) {
        return feedbackService.saveFeedback(feedback);
    }

    @GetMapping
    public List<Feedback> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }

    @GetMapping("/hospital/{hospitalId}")
    public List<Feedback> getFeedbacksByHospital(@PathVariable Long hospitalId) {
        return feedbackService.getFeedbacksByHospitalId(hospitalId);
    }

    @GetMapping("/hospitals/{id}/rating")
    public ResponseEntity<Double> getHospitalRating(@PathVariable Long id) {
        Double avgRating = feedbackService.getAverageRatingByHospital(id);
        return ResponseEntity.ok(avgRating != null ? avgRating : 0.0);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Feedback> updateFeedback(@PathVariable Long id, @RequestBody Feedback updatedFeedback) {
        Feedback feedback = feedbackService.updateFeedback(id, updatedFeedback);
        if (feedback != null) {
            return ResponseEntity.ok(feedback);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long id) {
        boolean deleted = feedbackService.deleteFeedback(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
