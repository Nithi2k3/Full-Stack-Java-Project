package Code.Project.HospitalSelectioSystem.service;

import Code.Project.HospitalSelectioSystem.model.Feedback;
import Code.Project.HospitalSelectioSystem.model.Hospital;
import Code.Project.HospitalSelectioSystem.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;

    public Double getAverageRatingByHospital(Long hospitalId) {
        Double avgRating = feedbackRepository.findAverageRatingByHospitalId(hospitalId);
        return avgRating != null ? avgRating : 0.0;
    }

    public FeedbackService(FeedbackRepository feedbackRepository) {
        this.feedbackRepository = feedbackRepository;
    }

    public Feedback saveFeedback(Feedback feedback) {
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
    public List<Feedback> getFeedbacksByHospitalId(Long hospitalId) {
        return feedbackRepository.findByHospitalId(hospitalId);
    }

    public Feedback updateFeedback(Long id, Feedback updatedFeedback) {
        Optional<Feedback> existing = feedbackRepository.findById(id);
        if (existing.isPresent()) {
            Feedback feedback = existing.get();
            feedback.setHospitalName(updatedFeedback.getHospitalName());
            feedback.setUserName(updatedFeedback.getUserName());
            feedback.setEmail(updatedFeedback.getEmail());
            feedback.setMessage(updatedFeedback.getMessage());
            feedback.setRating(updatedFeedback.getRating());
            feedback.setHospitalId(updatedFeedback.getHospitalId());
            return feedbackRepository.save(feedback);
        } else {
            return null;
        }
    }

    public boolean deleteFeedback(Long id) {
        if (feedbackRepository.existsById(id)) {
            feedbackRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
