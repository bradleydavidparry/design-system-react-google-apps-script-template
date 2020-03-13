import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { 
    calculateDepartmentUsageBillingTotal
 } from '../functions/departmentFunctions';
import formatMoney from '../functions/utilities';

function UsageSection(props) {
    const { department } = props;
    
    const billingAmount = calculateDepartmentUsageBillingTotal(department);

    return (
        <Alert variant={'dark'}>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <h5>Total Amount To Bill</h5>
                    </Col>
                </Row>
                <Row className='text-center'>
                    <Col>{formatMoney(billingAmount)}</Col>
                </Row>
            </Container>
        </Alert>
    )
}

export default UsageSection;