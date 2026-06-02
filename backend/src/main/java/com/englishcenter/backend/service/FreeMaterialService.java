package com.englishcenter.backend.service;

import com.englishcenter.backend.dto.FreeMaterialRequest;
import com.englishcenter.backend.dto.FreeMaterialResponse;
import com.englishcenter.backend.dto.GradeFreeMaterialResponse;
import com.englishcenter.backend.dto.SubmitFreeMaterialRequest;

import java.util.List;

/**
 * ================================================================
 * SERVICE INTERFACE: FreeMaterialService
 * ================================================================
 */
public interface FreeMaterialService {

    List<FreeMaterialResponse> getAllFreeMaterials();

    FreeMaterialResponse getFreeMaterialById(Integer id);

    FreeMaterialResponse createFreeMaterial(FreeMaterialRequest request);

    FreeMaterialResponse updateFreeMaterial(Integer id, FreeMaterialRequest request);

    void deleteFreeMaterial(Integer id);

    GradeFreeMaterialResponse submitAnswers(Integer id, SubmitFreeMaterialRequest request);

    void initDefaultFreeMaterials();
}
