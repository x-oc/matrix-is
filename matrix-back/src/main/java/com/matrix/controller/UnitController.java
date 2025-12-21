package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.entity.primary.Unit;
import com.matrix.service.UnitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController extends BaseController {

    private final UnitService unitService;

    @GetMapping("/candidates")
    public ResponseEntity<ApiResponse<List<Unit>>> getCandidates() {
        List<Unit> candidates = unitService.findCandidates();
        return success(candidates);
    }

    @GetMapping("/high-disagreement")
    public ResponseEntity<ApiResponse<List<Unit>>> getUnitsWithHighDisagreement() {
        List<Unit> units = unitService.getUnitsWithHighDisagreement();
        return success(units);
    }

    @PostMapping("/{unitId}/select-chosen-one")
    public ResponseEntity<ApiResponse<ChosenOne>> selectChosenOne(
            @PathVariable Long unitId,
            @RequestParam Long selectedBy,
            @RequestParam Long matrixIterationId) {
        ChosenOne chosenOne = unitService.selectChosenOne(unitId, selectedBy, matrixIterationId);
        return success("Chosen one selected successfully", chosenOne);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Unit>>> getAllUnits() {
        List<Unit> units = unitService.findAll();
        return success(units);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Unit>> getUnitById(@PathVariable Long id) {
        Unit unit = unitService.findById(id);
        return success(unit);
    }
}