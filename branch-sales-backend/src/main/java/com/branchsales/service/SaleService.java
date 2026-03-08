package com.branchsales.service;

import com.branchsales.entity.Sale;
import com.branchsales.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class SaleService {
    private final SaleRepository saleRepository;

    public SaleService(SaleRepository saleRepository) {
        this.saleRepository = saleRepository;
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    @Transactional
    public Optional<Sale> getSaleById(Long id) {
        Optional<Sale> sale = saleRepository.findById(id);
        sale.ifPresent(s -> {
            // Force initialization of lazy items
            if (s.getItems() != null) {
                s.getItems().size();
            }
        });
        return sale;
    }
}
