package com.englishcenter.backend.controller;

import com.englishcenter.backend.dto.FreeMaterialRequest;
import com.englishcenter.backend.dto.FreeMaterialResponse;
import com.englishcenter.backend.dto.GradeFreeMaterialResponse;
import com.englishcenter.backend.dto.SubmitFreeMaterialRequest;
import com.englishcenter.backend.service.FreeMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ================================================================
 * CONTROLLER: FreeMaterialController
 * Cung cấp API tải tài liệu công khai và quản trị cho Admin/Teacher.
 * ================================================================
 */
@RestController
@RequestMapping("/api/free-materials")
@CrossOrigin(origins = "http://localhost:5173")
public class FreeMaterialController {

    @Autowired
    private FreeMaterialService freeMaterialService;

    // GET /api/free-materials
    @GetMapping
    public ResponseEntity<List<FreeMaterialResponse>> getAllFreeMaterials() {
        return ResponseEntity.ok(freeMaterialService.getAllFreeMaterials());
    }

    // GET /api/free-materials/{id}
    @GetMapping("/{id}")
    public ResponseEntity<FreeMaterialResponse> getFreeMaterialById(@PathVariable Integer id) {
        return ResponseEntity.ok(freeMaterialService.getFreeMaterialById(id));
    }

    // POST /api/free-materials
    @PostMapping
    public ResponseEntity<FreeMaterialResponse> createFreeMaterial(@RequestBody FreeMaterialRequest request) {
        FreeMaterialResponse created = freeMaterialService.createFreeMaterial(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/free-materials/{id}
    @PutMapping("/{id}")
    public ResponseEntity<FreeMaterialResponse> updateFreeMaterial(
            @PathVariable Integer id,
            @RequestBody FreeMaterialRequest request) {
        return ResponseEntity.ok(freeMaterialService.updateFreeMaterial(id, request));
    }

    // DELETE /api/free-materials/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFreeMaterial(@PathVariable Integer id) {
        freeMaterialService.deleteFreeMaterial(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/free-materials/{id}/submit
    @PostMapping("/{id}/submit")
    public ResponseEntity<GradeFreeMaterialResponse> submitAnswers(
            @PathVariable Integer id,
            @RequestBody SubmitFreeMaterialRequest request) {
        return ResponseEntity.ok(freeMaterialService.submitAnswers(id, request));
    }
}
