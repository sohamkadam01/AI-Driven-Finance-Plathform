package com.College_project.project.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.College_project.project.models.OcrDocument;
import com.College_project.project.models.User;

@Repository
public interface OcrDocumentRepository extends JpaRepository<OcrDocument, Long> {
    List<OcrDocument> findByUser(User user);
    List<OcrDocument> findByUserAndProcessedFalse(User user);
    List<OcrDocument> findByUserOrderByUploadedAtDesc(User user);
    List<OcrDocument> findByProcessedFalse();

    // Check for existing document by file hash
    Optional<OcrDocument> findByFileHash(String fileHash);

    // Check for similar document by amount, vendor, and date
    @Query("SELECT d FROM OcrDocument d WHERE d.user = :user " +
           "AND d.extractedAmount = :amount " +
           "AND d.extractedVendor = :vendor " +
           "AND d.extractedDate = :date")
    Optional<OcrDocument> findSimilarDocument(@Param("user") User user,
                                               @Param("amount") String amount,
                                               @Param("vendor") String vendor,
                                               @Param("date") String date);
}