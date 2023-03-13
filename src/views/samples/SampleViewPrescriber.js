// ** React Imports
import { useState, useEffect } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Select from '@mui/material/Select'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import InputLabel from '@mui/material/InputLabel'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import LinearProgress from '@mui/material/LinearProgress'
import FormControlLabel from '@mui/material/FormControlLabel'
import DialogContentText from '@mui/material/DialogContentText'

// ** Icons Imports
import Check from 'mdi-material-ui/Check'
import Circle from 'mdi-material-ui/Circle'
import BriefcaseVariantOutline from 'mdi-material-ui/BriefcaseVariantOutline'

// ** Custom Components
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'
import { useSelector } from 'react-redux'

// ** Styled <sup> component
const Sup = styled('sup')(({ theme }) => ({
  top: '0.2rem',
  left: '-0.6rem',
  position: 'absolute',
  color: theme.palette.primary.main
}))

// ** Styled <sub> component
const Sub = styled('sub')({
  fontWeight: 300,
  fontSize: '1rem',
  alignSelf: 'flex-end'
})

const roleColors = {
  admin: 'error',
  editor: 'info',
  author: 'warning',
  maintainer: 'success',
  subscriber: 'primary'
}

const statusColors = {
  active: 'success',
  pending: 'warning',
  inactive: 'secondary'
}

const SampleViewPrescriber = ({ data }) => {
  // ** States
  const [openEdit, setOpenEdit] = useState(false)
  const [openPlans, setOpenPlans] = useState(false)

  const [jobsSubmitted, setJobsSubmitted] = useState(0)
  const [jobsSubmittedInRadius, setJobsSubmittedInRadius] = useState(0)
  const store = useSelector(state => state)

  // Handle Edit dialog
  const handleEditClickOpen = () => setOpenEdit(true)
  const handleEditClose = () => setOpenEdit(false)

  // Handle Upgrade Plan dialog
  const handlePlansClickOpen = () => setOpenPlans(true)
  const handlePlansClose = () => setOpenPlans(false)

  useEffect(() => {
    let flagCountSubmitted = store.jobs.data.filter(
      val => val.prescriber.id == data.id && val.job_stage == 'Feedback completed'
    )
    let flagCountSubmittedInRadius = store.jobs.data.filter(
      val =>
        val.prescriber.id == data.id &&
        val.job_stage == 'Feedback completed' &&
        parseFloat(val.difference_location_doctor__c) < 1 &&
        parseFloat(val.difference_location_doctor__c) > 0
    )
    setJobsSubmitted(flagCountSubmitted.length)
    setJobsSubmittedInRadius(flagCountSubmittedInRadius.length)
  }, [data.id, store.jobs.data])

  const renderUserAvatar = () => {
    return (
      <CustomAvatar
        skin='light'
        variant='rounded'
        color={data.avatarColor}
        sx={{ width: 120, height: 120, fontWeight: 600, marginBottom: 4, fontSize: '3rem' }}
      >
        {getInitials(data.Prescriber_Name__c)}
      </CustomAvatar>
    )
  }

  if (data) {
    return (
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ paddingTop: 15, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
              {renderUserAvatar()}
              <Typography variant='h6' sx={{ marginBottom: 2 }}>
                {data?.Prescriber_Name__c}
              </Typography>
              <CustomChip
                skin='light'
                size='small'
                label='Prescriber'
                color={'success'}
                sx={{
                  height: 20,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: '5px',
                  textTransform: 'capitalize',
                  '& .MuiChip-label': { mt: -0.25 }
                }}
              />
            </CardContent>

            {/* <CardContent sx={{ marginTop: 2 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ marginRight: 8, display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ marginRight: 3 }}>
                    <Check />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                      {jobsSubmitted}
                    </Typography>
                    <Typography variant='body2'>Submitted</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CustomAvatar skin='light' variant='rounded' sx={{ marginRight: 3 }}>
                    <BriefcaseVariantOutline />
                  </CustomAvatar>
                  <Box>
                    <Typography variant='h6' sx={{ lineHeight: 1.3 }}>
                      {jobsSubmittedInRadius}
                    </Typography>
                    <Typography variant='body2'>Within Radius</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent> */}

            <CardContent>
              <Typography variant='h6'>Details</Typography>
              <Divider />
              <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>NPI Number:</Typography>
                  <Typography variant='body2'>{data?.Prescriber_Npi__c}</Typography>
                </Box>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>Speciality:</Typography>
                  <Typography variant='body2'>{data?.Prescriber_Speciality__c}</Typography>
                </Box>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>Street:</Typography>
                  <Typography variant='body2'>{data?.Prescriber_Street__c}</Typography>
                </Box>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>State:</Typography>
                  <Typography variant='body2'>{data?.Prescriber_State__c}</Typography>
                </Box>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>Zip:</Typography>
                  <Typography variant='body2'>{data?.Prescriber_Zip__c}</Typography>
                </Box>
                <Box sx={{ display: 'flex', marginBottom: 2.7 }}>
                  <Typography sx={{ marginRight: 2, fontWeight: 500, fontSize: '0.875rem' }}>Phone:</Typography>
                  <Typography variant='body2'>+1 {data?.Prescriber_Phone__c}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  } else {
    return null
  }
}

export default SampleViewPrescriber
