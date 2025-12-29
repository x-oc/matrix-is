package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.request.AdministerSectorRequest;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.SectorResponse;
import com.matrix.entity.auxiliary.Sector;
import com.matrix.service.SectorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sectors")
@RequiredArgsConstructor
public class SectorController extends BaseController {

    private final SectorService sectorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getAllSectors() {
        List<Sector> sectors = sectorService.findAll();
        return success(sectors.stream().map(CommonMapper::map).toList());
    }

    @GetMapping("/{sectorId}")
    public ResponseEntity<ApiResponse<SectorResponse>> getSector(@PathVariable Long sectorId) {
        Sector sector = sectorService.findById(sectorId);
        return success(CommonMapper.map(sector));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SectorResponse>> createSector(@RequestParam String code) {
        Sector sector = sectorService.createSector(code);
        return created("Sector created", CommonMapper.map(sector));
    }

    @PostMapping("/{sectorId}/administer")
    public ResponseEntity<ApiResponse<Void>> administerSector(
            @PathVariable Long sectorId,
            @Valid @RequestBody AdministerSectorRequest request) {
        sectorService.save(request);
        String result = "Patch applied to sector " + sectorId + ".";
        return success(result);
    }
}