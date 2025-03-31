import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';

export function ConsultantSpeedDial() {
  const router = useRouter();

  const actions = [
    {
      icon: <PersonAddIcon />,
      name: 'Nuevo Cliente',
      action: () => router.push('/consultant/clients/new')
    },
    {
      icon: <ShoppingCartIcon />,
      name: 'Nueva Venta',
      action: () => router.push('/consultant/sales/new')
    }
  ];

  return (
    <SpeedDial
      ariaLabel="Acciones Rápidas"
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16,
        '& .MuiSpeedDial-fab': {
          width: 70,  // Botón principal más grande
          height: 70, // Botón principal más grande
          backgroundColor: '#F5DADF',
          '&:hover': {
            backgroundColor: '#eec4cc'  // Color hover más oscuro
          },
          '& .MuiSvgIcon-root': {
            fontSize: 35,  // Icono principal más grande
            color: '#000000'
          }
        }
      }}
      icon={<SpeedDialIcon openIcon={<AddIcon />} />}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          tooltipTitle={action.name}
          onClick={action.action}
          sx={{
            width: 50,  // Botones de acciones más grandes
            height: 50,
            '& .MuiSvgIcon-root': {
              fontSize: 28  // Iconos de acciones más grandes
            }
          }}
        />
      ))}
    </SpeedDial>
  );
}