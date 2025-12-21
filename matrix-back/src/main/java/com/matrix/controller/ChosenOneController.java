package com.matrix.controller;

import com.matrix.dto.request.SelectChosenOneRequest;
import com.matrix.dto.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<ChosenOne>> selectChosenOne(
            @Valid @RequestBody SelectChosenOneRequest request) {
        ChosenOne chosenOne = chosenOneService.selectChosenOne(
                request.getUnitId(),
                request.getSelectedBy(),
                request.getMatrixIterationId()
        );
        return created("Chosen one selected", chosenOne);
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<ChosenOne>> getCurrentChosenOne() {
        ChosenOne chosenOne = chosenOneService.getCurrentChosenOne();
        return success(chosenOne);
    }

    @PutMapping("/{id}/lift-restrictions")
    public ResponseEntity<ApiResponse<ChosenOne>> liftRestrictions(@PathVariable Long id) {
        ChosenOne chosenOne = chosenOneService.liftRestrictions(id);
        return success("Restrictions lifted", chosenOne);
    }

    @PostMapping("/{id}/final-interview")
    public ResponseEntity<ApiResponse<Void>> conductFinalInterview(
            @PathVariable Long id,
            @RequestParam String decision) {
        String result = chosenOneService.conductFinalInterview(id, decision);
        return success(result);
    }

    @GetMapping("/iteration/{iterationId}")
    public ResponseEntity<ApiResponse<List<ChosenOne>>> getByIteration(@PathVariable Long iterationId) {
        List<ChosenOne> chosenOnes = chosenOneService.getByIteration(iterationId);
        return success(chosenOnes);
    }
}