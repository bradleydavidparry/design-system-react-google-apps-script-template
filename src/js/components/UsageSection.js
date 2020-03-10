import React from 'react';
import Alert from 'react-bootstrap/Alert'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import map from 'lodash/map';

import { calculateDepartmentUsageBillingTotal } from '../functions/departmentFunctions';
import formatMoney from '../functions/utilities';

function UsageSection(props) {
    const { department } = props;

    return (
        <Alert variant={'danger'}>
            <Container>
                <Row>
                    <Col className='text-center'>
                        <h5>Usage</h5>
                    </Col>
                </Row>
                <Row>
                    <Col>{formatMoney(calculateDepartmentUsageBillingTotal(department))}</Col>
                    <Col></Col>
                </Row>
                

            </Container>
        </Alert>
    )
}

export default UsageSection;