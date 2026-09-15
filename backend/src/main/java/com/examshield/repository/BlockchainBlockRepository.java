package com.examshield.repository;

import com.examshield.entity.BlockchainBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BlockchainBlockRepository extends JpaRepository<BlockchainBlock, Long> {
    List<BlockchainBlock> findAllByOrderByBlockIndexAsc();
    Optional<BlockchainBlock> findTopByOrderByBlockIndexDesc();
    Optional<BlockchainBlock> findByBlockIndex(Long blockIndex);
}
