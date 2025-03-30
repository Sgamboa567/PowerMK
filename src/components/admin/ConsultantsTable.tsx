import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Button,
  Tooltip,
  useTheme
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Consultant {
  id: string;
  name: string;
  document: string;
  registrationDate: string;
  lastPayment: string;
  status: 'active' | 'pending' | 'suspended';
}

export function ConsultantsTable() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Mock data - replace with actual API call
  const consultants: Consultant[] = [
    {
      id: '1',
      name: 'Ana García',
      document: '1234567890',
      registrationDate: '2024-03-15',
      lastPayment: '2024-03-01',
      status: 'active',
    },
    // Add more mock data as needed
  ];

  const getStatusColor = (status: Consultant['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Consultant['status']) => {
    switch (status) {
      case 'active':
        return 'Al día';
      case 'pending':
        return 'Pendiente';
      case 'suspended':
        return 'Suspendida';
      default:
        return status;
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper 
      sx={{ 
        width: '100%',
        background: theme.palette.mode === 'dark' ? 'rgba(26,26,26,0.9)' : 'white',
      }}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Fecha de Registro</TableCell>
              <TableCell>Último Pago</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {consultants
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((consultant) => (
                <TableRow
                  key={consultant.id}
                  sx={{
                    backgroundColor: consultant.status === 'pending' 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(245,218,223,0.05)'
                        : '#FFF2F5'
                      : 'inherit'
                  }}
                >
                  <TableCell>{consultant.name}</TableCell>
                  <TableCell>{consultant.document}</TableCell>
                  <TableCell>
                    {format(new Date(consultant.registrationDate), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(consultant.lastPayment), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(consultant.status)}
                      color={getStatusColor(consultant.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="Marcar como pagado">
                        <IconButton 
                          size="small"
                          color="success"
                          disabled={consultant.status === 'active'}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Suspender">
                        <IconButton 
                          size="small"
                          color="error"
                          disabled={consultant.status === 'suspended'}
                        >
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={consultants.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Filas por página"
      />
    </Paper>
  );
}