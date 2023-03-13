// ** React Imports
import { Fragment, useState, useEffect, forwardRef } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Menu from '@mui/material/Menu'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import CardContent from '@mui/material/CardContent'
import { DataGrid } from '@mui/x-data-grid'
import Select from '@mui/material/Select'

// ** Icons Imports
import Send from 'mdi-material-ui/Send'
import Check from 'mdi-material-ui/Check'
import Close from 'mdi-material-ui/Close'
import ChartPie from 'mdi-material-ui/ChartPie'
import Download from 'mdi-material-ui/Download'
import ArrowDown from 'mdi-material-ui/ArrowDown'
import EyeOutline from 'mdi-material-ui/EyeOutline'
import TrendingUp from 'mdi-material-ui/TrendingUp'
import ContentCopy from 'mdi-material-ui/ContentCopy'
import DotsVertical from 'mdi-material-ui/DotsVertical'
import PencilOutline from 'mdi-material-ui/PencilOutline'
import DeleteOutline from 'mdi-material-ui/DeleteOutline'
import InformationOutline from 'mdi-material-ui/InformationOutline'
import ContentSaveOutline from 'mdi-material-ui/ContentSaveOutline'

// ** Third Party Imports
import format from 'date-fns/format'
import DatePicker from 'react-datepicker'

// ** Store & Actions Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchData, deleteInvoice } from 'src/store/apps/invoice'
import { debounce } from 'lodash'

// ** Utils Import
import { getInitials } from 'src/@core/utils/get-initials'

// ** Custom Components Imports
import CustomChip from 'src/@core/components/mui/chip'
import CustomAvatar from 'src/@core/components/mui/avatar'
import TableHeader from 'src/views/apps/invoice/list/TableHeader'

// ** Third Party Styles Imports
import 'react-datepicker/dist/react-datepicker.css'

// ** Styled Components
import DatePickerWrapper from 'src/@core/styles/libs/react-datepicker'
import {
  onUpdateProductAdvocateStatusUpdateHandler,
  onProductAdvocateStatusChangeHandler,
  updateProductAdvocateStatus,
  fetchProductAdvocatesData
} from 'src/store/product_advocates'
import ProductAdvocateAddSampleQuantity from 'src/views/product_advocates/ProductAdvocateAddSampleQuantity'
import { status } from 'nprogress'

// ** Styled component for the link in the dataTable
const StyledLink = styled('a')(({ theme }) => ({
  textDecoration: 'none',
  color: theme.palette.primary.main
}))

/* eslint-enable */
const InvoiceList = () => {
  // ** State
  const [dates, setDates] = useState([])
  const [value, setValue] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [statusValue, setStatusValue] = useState('')
  const [showSampleQuantity, setShowSampleQuantity] = useState('')
  const [selectedRow, setSelectedRow] = useState(undefined)
  const [page, setPage] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [active, setActive] = useState('')
  const [name_email, setNameEmail] = useState('')

  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state)

  useEffect(() => {
    const fetchProductAdvocates = debounce(() => {
      if (store.product_advocates.totalRecords || store.product_advocates.data) {
        let page_size = pageSize
        if (pageSize * (page + 1) > store.product_advocates.totalRecords) {
          const Remain = pageSize * (page + 1) - store.product_advocates.totalRecords
          page_size = pageSize - Remain
        }
        setIsLoading(true)
        if (name_email?.length == 0) {
          page_size = pageSize
        }
        dispatch(
          fetchProductAdvocatesData({
            page_num: page + 1,
            page_size: page_size,
            active_status: store.product_advocates.filter.Active__c,
            name_email: store.product_advocates.filter.ProductAdvocateValue
          })
        ).then(() => setIsLoading(false))
      }
    }, 2000) // 2000ms debounce time

    fetchProductAdvocates()

    return () => fetchProductAdvocates.cancel() // cancel pending debounced invocation on unmount or re-render
  }, [pageSize, page, store.product_advocates.filter, name_email])

  useEffect(() => {
    setIsLoading(true)
    dispatch(fetchProductAdvocatesData({ page_num: page + 1, page_size: pageSize, active_status: active })).then(() => {
      setIsLoading(false)
    })
  }, [])
  // useEffect(() => {
  //   setIsLoading(true)
  //   dispatch(fetchProductAdvocatesData({ page_num: page + 1, page_size: pageSize, active_status: active })).then(() =>
  //     setIsLoading(false)
  //   )
  // }, [])

  const handleFilter = val => {
    setValue(val)
  }

  const handleStatusValue = e => {
    dispatch(onProductAdvocateStatusChangeHandler({ filter: 'Active__c', value: e.target.value }))
  }

  const handleProductAdvocateValue = e => {
    dispatch(onProductAdvocateStatusChangeHandler({ filter: 'ProductAdvocateValue', value: e.target.value }))
  }

  const handleStatusUpdateHandler = (product_advocate_id, Active__c) => {
    // Call the update API
    const data = {
      product_advocate_id: product_advocate_id,
      Active__c: Active__c
    }
    dispatch(updateProductAdvocateStatus(data))
    setNameEmail('')

    // Update the state of the product activate in the store
    // var temp = store.product_advocates.data.map(s => Object.assign({}, s))
    // const index = (temp.findIndex = temp.findIndex(d => d.id == product_advocate_id))
    // temp[index].Active__c = Active__c
    // dispatch(onUpdateProductAdvocateStatusUpdateHandler(temp))
  }

  const RowOptions = ({ row }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = event => {
      setAnchorEl(event.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    return (
      <Fragment>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <DotsVertical fontSize='small' />
        </IconButton>
        <Menu
          keepMounted
          disablePortal
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
        >
          <MenuItem
            onClick={() => {
              handleStatusUpdateHandler(row?.id, !row?.Active__c)
              handleRowOptionsClose()
            }}
          >
            {!row?.Active__c ? <Check sx={{ fontSize: '1rem' }} /> : <Close sx={{ fontSize: '1rem' }} />}
            <span style={{ marginLeft: '4px' }}>{row?.Active__c ? 'Inactive' : 'Active'}</span>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setShowSampleQuantity(true)
              setSelectedRow(row)
            }}
          >
            Add Sample Quantity
          </MenuItem>
        </Menu>
      </Fragment>
    )
  }

  const defaultColumns = [
    {
      field: 'name',
      minWidth: 180,
      headerName: 'Name',
      renderCell: ({ row }) => (
        <Link href={`/product_advocates/preview/${row.Id}`} passHref>
          <StyledLink>{`${row?.name}`}</StyledLink>
        </Link>
      )
    },
    {
      flex: 0.2,
      minWidth: 150,
      field: 'email',
      headerName: 'Email',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.email || ''}</Typography>
    },
    // {
    //   flex: 0.2,
    //   minWidth: 250,
    //   field: 'address',
    //   headerName: 'Address',
    //   renderCell: ({ row }) => {
    //     const location = JSON?.parse(row?.Location__c)
    //     var address = ''
    //     location?.street ? (address += location.street) : ''
    //     location?.city ? (address += ', ' + location.city) : ''
    //     location?.state ? (address += ', ' + location.state) : ''
    //     location?.zipcode ? (address += ', ' + location.zipcode) : ''

    //     return <Typography variant='body2'>{address || ''}</Typography>
    //   }
    // },
    {
      flex: 0.2,
      minWidth: 130,
      field: 'Phone__c',
      headerName: 'Phone',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.Phone__c || ''}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'Stock_20__c',
      headerName: 'Total 20 MG',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.Stock_20__c || '0'}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 110,
      field: 'Stock_60__c',
      headerName: 'Total 60 MG',
      renderCell: ({ row }) => <Typography variant='body2'>{row?.Stock_60__c || '0'}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 90,
      field: 'Active__c',
      headerName: 'Active',
      renderCell: ({ row }) => (
        <CustomAvatar
          skin='light'
          color={row?.Active__c ? 'success' : 'error'}
          sx={{ width: '1.875rem', height: '1.875rem' }}
        >
          {row?.Active__c ? <Check sx={{ fontSize: '1rem' }} /> : <Close sx={{ fontSize: '1rem' }} />}
        </CustomAvatar>
      )
    },
    {
      flex: 0.2,
      minWidth: 90,
      field: 'Admin__c',
      headerName: 'Admin',
      renderCell: ({ row }) => (
        <CustomAvatar
          skin='light'
          color={row?.Admin__c ? 'success' : 'error'}
          sx={{ width: '1.875rem', height: '1.875rem' }}
        >
          {row?.Admin__c ? <Check sx={{ fontSize: '1rem' }} /> : <Close sx={{ fontSize: '1rem' }} />}
        </CustomAvatar>
      )
    },
    {
      flex: 0.2,
      minWidth: 110,
      sortable: false,
      field: 'actions',
      headerName: 'Actions',
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='View'>
            <Box>
              <Link href={`/product_advocates/preview/${row.id}`} passHref>
                <IconButton size='small' component='a' sx={{ textDecoration: 'none' }}>
                  <EyeOutline fontSize='small' />
                </IconButton>
              </Link>
            </Box>
          </Tooltip>
          <RowOptions row={row} />
        </Box>
      )
    }
  ]

  const columns = [...defaultColumns]

  const filterProductAdvocate = (advocate, index) => {
    if (store.product_advocates.filter.Active__c == '') {
      return true
    } else {
      const status = Boolean(store.product_advocates.filter.Active__c == 'active')
      return Boolean(advocate.Active__c) === status
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Filters' />
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id='invoice-status-select'>Status</InputLabel>

                  <Select
                    fullWidth
                    sx={{ mr: 4, mb: 2 }}
                    label='Advocate Status'
                    onChange={handleStatusValue}
                    labelId='invoice-status-select'
                    value={store.product_advocates.filter.Active__c}
                  >
                    <MenuItem value=''>Select Product Advocate Status</MenuItem>
                    <MenuItem value='true'>Active</MenuItem>
                    <MenuItem value='false'>Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={6}>
                <FormControl fullWidth>
                  <TextField
                    value={store.product_advocates.filter.ProductAdvocateValue}
                    id='outlined-basic'
                    label='Search By Name or Email'
                    onChange={handleProductAdvocateValue}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}></Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card>
          {/* <TableHeader value={value} selectedRows={selectedRows} handleFilter={handleFilter} /> */}
          {Boolean(selectedRow) && Boolean(showSampleQuantity) && (
            <ProductAdvocateAddSampleQuantity
              open={showSampleQuantity}
              row={selectedRow}
              handleClose={() => setShowSampleQuantity(false)}
            />
          )}
          {/* <DataGrid
            autoHeight
            pagination
            rows={store.product_advocates.data.filter(filterProductAdvocate)}
            columns={columns}
            // checkboxSelection

            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onSelectionModelChange={rows => setSelectedRows(rows)}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
          /> */}

          <DataGrid
            autoHeight
            pagination
            rows={isLoading ? [] : store.product_advocates.data}
            columns={columns}
            loading={isLoading}
            // checkboxSelection
            rowCount={store.product_advocates.totalRecords}
            disableSelectionOnClick
            pageSize={Number(pageSize)}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={newPage => {
              setPage(newPage)
            }}
            onSelectionModelChange={rows => setSelectedRow(rows)}
            onPageSizeChange={newPageSize => setPageSize(newPageSize)}
            paginationMode='server'
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default InvoiceList
