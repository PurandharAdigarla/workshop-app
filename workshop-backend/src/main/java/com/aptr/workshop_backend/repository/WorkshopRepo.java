package com.aptr.workshop_backend.repository;

import com.aptr.workshop_backend.entity.Workshop;
import com.aptr.workshop_backend.enums.WorkshopState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkshopRepo extends JpaRepository<Workshop, Long> {
    Optional<Workshop> findByWorkshopId(Long workshopId);
    List<Workshop> findByWorkshopState(WorkshopState workshopState);

//    @Query("SELECT w FROM Workshop w WHERE w.workshopState = :state AND w.isWorkshopDeleted = false")
//    List<Workshop> findAllByStateAndNotDeleted(@Param("state") WorkshopState workshopState);

    Optional<Workshop> findByWorkshopIdAndIsWorkshopDeletedFalse(Long workshopId);
    List<Workshop> findByWorkshopStateAndIsWorkshopDeletedFalse(WorkshopState workshopState);
    List<Workshop> findByIsWorkshopDeletedFalse();
}


