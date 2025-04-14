package com.aptr.workshop_backend.service;

import com.aptr.workshop_backend.entity.Workshop;
import com.aptr.workshop_backend.enums.WorkshopState;
import com.aptr.workshop_backend.repository.WorkshopRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WorkshopStateUpdater {
    private final WorkshopRepo workshopRepo;

    @Scheduled(cron ="0 0 0 * * *") 
    public void updateWorkshopState(){
        processWorkshops();
    }
    
    public Map<String, Integer> manualUpdate() {
        System.out.println("Manual workshop state update triggered");
        return processWorkshops();
    }
    
    private Map<String, Integer> processWorkshops() {
        LocalDate currentDate = LocalDate.now();
        System.out.println("Updating workshop states for date: " + currentDate);
        
        List<Workshop> workshops = workshopRepo.findByIsWorkshopDeletedFalse();
        System.out.println("Found " + workshops.size() + " active workshops");
        
        int upcoming = 0, ongoing = 0, completed = 0, changed = 0;

        for (Workshop workshop : workshops){
            WorkshopState oldState = workshop.getWorkshopState();
            WorkshopState newState;
            
            if(workshop.getEndDate().isBefore(currentDate)){
                newState = WorkshopState.COMPLETED;
                completed++;
            } else if (workshop.getStartDate().isAfter(currentDate)) {
                newState = WorkshopState.UPCOMING;
                upcoming++;
            } else {
                newState = WorkshopState.ONGOING;
                ongoing++;
            }
            
            if (oldState != newState) {
                System.out.println("Changing workshop '" + workshop.getWorkshopTitle() + 
                                   "' from " + oldState + " to " + newState);
                workshop.setWorkshopState(newState);
                changed++;
            }
        }
        
        if (changed > 0) {
            workshopRepo.saveAll(workshops);
            System.out.println("Updated " + changed + " workshops");
        } else {
            System.out.println("No workshop states needed to be updated");
        }
        
        Map<String, Integer> result = new HashMap<>();
        result.put("upcoming", upcoming);
        result.put("ongoing", ongoing);
        result.put("completed", completed);
        result.put("changed", changed);
        result.put("total", workshops.size());
        
        return result;
    }
}
