import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { convertDateToReadableFormat } from 'src/configs/utils'

const StyledLink = styled('a')(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

export const jobsListViewColumns = [
  {
    field: 'id',
    minWidth: 200,
    headerName: 'id',
    renderCell: ({ row }) => (
      <Link href={`/jobs/preview/${row.Id}`} passHref>
        <StyledLink>{`${row.Id}`}</StyledLink>
      </Link>
    )
  },
  {
    minWidth: 160,
    field: 'Status__c',
    headerName: 'Status',
    renderCell: ({ row }) => {
      <Typography variant='caption' sx={{ color: 'common.white', fontWeight: 600 }}>
        {row.Status__c}
      </Typography>
    }
  },
  {
    flex: 0.5,
    field: 'Prescriber__r',
    minWidth: 300,
    headerName: 'Prescriber',
    renderCell: ({ row }) => {
      const { Prescriber__r } = row
      console.log('Prescriber', Prescriber__r)
      console.log('Prescriber Row', row)

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Link href={`/prescribers/preview/${Prescriber__r.Id}`} passHref>
              <StyledLink>{Prescriber__r.Name}</StyledLink>
            </Link>
            <Typography noWrap variant='caption'>
              {Prescriber__r.Street_Address__c}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.5,
    field: 'product_advocate_name',
    minWidth: 200,
    headerName: 'Product Advocate',
    renderCell: ({ row }) => {
      const { Product_Advocate__r } = row

      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Link href={`/product_advocates/preview/${Product_Advocate__r.Id}`} passHref>
              <StyledLink>{Product_Advocate__r.Name}</StyledLink>
            </Link>
            <Typography noWrap variant='caption'>
              {Product_Advocate__r.Email__c}
            </Typography>
          </Box>
        </Box>
      )
    }
  },
  {
    flex: 0.2,
    minWidth: 150,
    field: 'feedback_submitted_at__c',
    headerName: 'Feedback Submitted At',
    renderCell: ({ row }) => (
      <Typography variant='body2'>{convertDateToReadableFormat(row.feedback_submitted_at__c) || ''}</Typography>
    )
  },
  {
    flex: 0.3,
    minWidth: 70,
    field: 'difference_location_doctor__c',
    headerName: 'Feedback Distance',
    renderCell: ({ row }) => {
      var target = parseFloat(row.difference_location_doctor__c)

      return (
        <Typography style={{ color: target ? (target > 0.1 ? 'red' : 'green') : 'initial' }} variant='body2'>
          {target ? target.toFixed(2) : ''}
        </Typography>
      )
    }
  }
]
