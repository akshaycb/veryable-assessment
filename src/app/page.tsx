"use client";

import { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  TextField,
  TableSortLabel,
} from "@mui/material";
import { Operator, Op } from "../types";

export default function Home() {
  const [ops, setOps] = useState<Op[]>([]);
  const [checkIns, setCheckIns] = useState<Record<string, { checkIn?: string; checkOut?: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'firstName' | 'lastName' | 'opsCompleted' | 'reliability'>('firstName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://frontend-challenge.veryableops.com/");
        const data: Op[] = await response.json();
        setOps(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Load checkIns from localStorage
    const stored = localStorage.getItem("checkIns");
    if (stored) {
      setCheckIns(JSON.parse(stored));
    }
  }, []);

  const handleCheckIn = (opIndex: number, operatorIndex: number) => {
    const key = `${opIndex}-${operatorIndex}`;
    const now = new Date().toISOString();
    const newCheckIns = { ...checkIns, [key]: { ...checkIns[key], checkIn: now } };
    setCheckIns(newCheckIns);
    localStorage.setItem("checkIns", JSON.stringify(newCheckIns));
  };

  const handleCheckOut = (opIndex: number, operatorIndex: number) => {
    const key = `${opIndex}-${operatorIndex}`;
    const now = new Date().toISOString();
    const newCheckIns = { ...checkIns, [key]: { ...checkIns[key], checkOut: now } };
    setCheckIns(newCheckIns);
    localStorage.setItem("checkIns", JSON.stringify(newCheckIns));
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredOps = ops?.filter(op => {
    const query = searchQuery?.toLowerCase();
    return (op?.opTitle?.toLowerCase()?.includes(query) ?? false) ||
           (op?.publicId?.toLowerCase()?.includes(query) ?? false) ||
           op?.operators?.some?.(operator => `${operator?.firstName} ${operator?.lastName}`.toLowerCase().includes(query));
  });

  return (
    <Stack sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Ops Dashboard
      </Typography>
      <TextField
        label="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2, maxWidth: 300 }}
      />
      {filteredOps.map((op, opIndex) => {
        const sortedOperators = [...op.operators].sort((a, b) => {
          let aVal: string | number, bVal: string | number;
          if (sortField === 'firstName') {
            aVal = a?.firstName || '';
            bVal = b?.firstName || '';
          } else if (sortField === 'lastName') {
            aVal = a?.lastName || '';
            bVal = b?.lastName || '';
          } else if (sortField === 'opsCompleted') {
            aVal = a?.opsCompleted ?? 0;
            bVal = b?.opsCompleted ?? 0;
          } else {
            aVal = a?.reliability ?? 0;
            bVal = b?.reliability ?? 0;
          }
          if (sortDirection === 'asc') {
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          } else {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
          }
        });
        return (
        <Box key={opIndex} sx={{ mb: 4 }}>
          <Typography variant="h6">{op?.opTitle || 'No Title'}</Typography>
          <Typography>Public ID: {op?.publicId || 'N/A'}</Typography>
          <Typography>Operators Needed: {op.operatorsNeeded || 'N/A'}</Typography>
          <Typography>Start Time: {op?.startTime ? new Date(op?.startTime).toLocaleDateString() : 'N/A'}</Typography>
          <Typography>End Time: {op?.endTime ? new Date(op?.endTime).toLocaleDateString() : 'N/A'}</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'firstName'}
                      direction={sortDirection}
                      onClick={() => handleSort('firstName')}
                    >
                      First Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'lastName'}
                      direction={sortDirection}
                      onClick={() => handleSort('lastName')}
                    >
                      Last Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'opsCompleted'}
                      direction={sortDirection}
                      onClick={() => handleSort('opsCompleted')}
                    >
                      Ops Completed
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'reliability'}
                      direction={sortDirection}
                      onClick={() => handleSort('reliability')}
                    >
                      Reliability
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Endorsements</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOperators.map((operator, operatorIndex) => {
                  const key = `${opIndex}-${operatorIndex}`;
                  const checkData = checkIns[key] || {};
                  return (
                  <TableRow key={operatorIndex}>
                    <TableCell>{operator?.firstName || 'N/A'}</TableCell>
                    <TableCell>{operator?.lastName || 'N/A'}</TableCell>
                    <TableCell>{operator?.opsCompleted ?? 0}</TableCell>
                    <TableCell>{((operator?.reliability ?? 0) * 100).toFixed(1)}%</TableCell>
                    <TableCell>{operator?.endorsements ?? 0}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleCheckIn(opIndex, operatorIndex)}
                        disabled={!!checkData.checkIn}
                      >
                        Check In
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => handleCheckOut(opIndex, operatorIndex)}
                        disabled={!checkData?.checkIn || !!checkData.checkOut}
                      >
                        Check Out
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        );
      })}
    </Stack>
  );
}
