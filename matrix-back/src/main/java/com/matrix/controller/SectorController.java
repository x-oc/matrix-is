package com.matrix.controller;

import com.matrix.dto.response.ApiResponse;
import com.matrix.entity.auxiliary.Sector;
import com.matrix.service.SectorService;
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
    public ResponseEntity<ApiResponse<List<Sector>>> getAllSectors() {
        List<Sector> sectors = sectorService.findAll();
        return success(sectors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sector>> getSectorById(@PathVariable Long id) {
        Sector sector = sectorService.findById(id);
        return success(sector);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<Sector>> getSectorByCode(@PathVariable String code) {
        Sector sector = sectorService.findByCode(code);
        return success(sector);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sector>> createSector(@RequestParam String code) {
        Sector sector = sectorService.createSector(code);
        return created("Sector created", sector);
    }
}