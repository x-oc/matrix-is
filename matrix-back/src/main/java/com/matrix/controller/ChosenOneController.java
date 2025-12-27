package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.request.SelectChosenOneRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.ChosenOneResponse;
import com.matrix.entity.primary.ChosenOne;
import com.matrix.service.ChosenOneService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chosen-ones")
@RequiredArgsConstructor
public class ChosenOneController extends BaseController {

    private final ChosenOneService chosenOneService;

    @PostMapping("/select")
    public ResponseEntity<ApiResponse<ChosenOneResponse>> selectChosenOne(
            @Valid @RequestBody SelectChosenOneRequest request) {
        ChosenOne chosenOne = chosenOneService.selectChosenOne(
                request.getUnitId(),
                request.getSelectedBy(),
                request.getMatrixIterationId()
        );
        return created("Chosen one selected", CommonMapper.map(chosenOne));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<ChosenOneResponse>> getCurrentChosenOne() {
        ChosenOne chosenOne = chosenOneService.getCurrentChosenOne();
        return success(CommonMapper.map(chosenOne));
    }

    @PutMapping("/{id}/lift-restrictions")
    public ResponseEntity<ApiResponse<ChosenOneResponse>> liftRestrictions(@PathVariable Long id) {
        ChosenOne chosenOne = chosenOneService.liftRestrictions(id);
        return success("Restrictions lifted", CommonMapper.map(chosenOne));
    }

    @PostMapping("/{id}/final-interview")
    public ResponseEntity<ApiResponse<Void>> conductFinalInterview(
            @PathVariable Long id,
            @RequestParam String decision) {
        String result = chosenOneService.conductFinalInterview(id, decision);
        return success(result);
    }

    @GetMapping("/iteration/{iterationId}")
    public ResponseEntity<ApiResponse<List<ChosenOneResponse>>> getByIteration(@PathVariable Long iterationId) {
        List<ChosenOne> chosenOnes = chosenOneService.getByIteration(iterationId);
        return success(chosenOnes.stream().map(CommonMapper::map).toList());
    }
}