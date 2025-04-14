package com.aptr.workshop_backend.specifications;

import com.aptr.workshop_backend.entity.Workshop;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.Date;

public class WorkshopSpecifications
{
    public static Specification<Workshop> upcomingWorkshop(Date currentDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThan(root.get("startDateTime"), currentDate);
    }

    public static Specification<Workshop> onGoingWorkshop(Date currentDate) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.and(
                criteriaBuilder.lessThanOrEqualTo(root.get("startDateTime"), currentDate),
                criteriaBuilder.greaterThanOrEqualTo(root.get("endDateTime"), currentDate)
        );
    }

    public static Specification<Workshop> completedWorkShop(Date currentDate) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThan(root.get("endDateTime"), currentDate);
    }

    public static Specification<Workshop> softDeletedWorkshop() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isWorkshopDeleted"));
    }

    public static Specification<Workshop> existingWorkshop() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.isFalse(root.get("isWorkshopDeleted"));
    }
}
