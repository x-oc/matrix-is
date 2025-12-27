package com.matrix.controller;

import com.matrix.dto.mappers.CommonMapper;
import com.matrix.dto.response.ApiResponse;
import com.matrix.dto.response.SectorResponse;
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
    public ResponseEntity<ApiResponse<List<SectorResponse>>> getAllSectors() {
        List<Sector> sectors = sectorService.findAll();
        return success(sectors.stream().map(CommonMapper::map).toList());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SectorResponse>> createSector(@RequestParam String code) {
        Sector sector = sectorService.createSector(code);
        return created("Sector created", CommonMapper.map(sector));
    }
}