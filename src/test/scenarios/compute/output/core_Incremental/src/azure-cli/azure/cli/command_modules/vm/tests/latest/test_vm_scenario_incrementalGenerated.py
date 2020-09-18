# --------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for
# license information.
#
# Code generated by Microsoft (R) AutoRest Code Generator.
# Changes may cause incorrect behavior and will be lost if the code is
# regenerated.
# --------------------------------------------------------------------------

import os
from azure.cli.testsdk import ScenarioTest
from .. import try_manual, raise_if, calc_coverage
from azure.cli.testsdk import ResourceGroupPreparer


TEST_DIR = os.path.abspath(os.path.join(os.path.abspath(__file__), '..'))


@try_manual
def setup(test, rg):
    pass


# EXAMPLE: /VirtualMachines/post/Assess patch state of a virtual machine.
@try_manual
def step__virtualmachines_post(test, rg):
    test.cmd('az vm virtual-machine assess-patch '
             '--resource-group "{rg}" '
             '--vm-name "myVMName"',
             checks=[])


@try_manual
def cleanup(test, rg):
    pass


@try_manual
def call_scenario(test, rg):
    setup(test, rg)
    step__virtualmachines_post(test, rg)
    cleanup(test, rg)


@try_manual
class ComputeManagementClientScenarioTest(ScenarioTest):

    @ResourceGroupPreparer(name_prefix='clitestvm_myResourceGroupName'[:7], key='rg', parameter_name='rg')
    def test_vm(self, rg):

        call_scenario(self, rg)
        calc_coverage(__file__)
        raise_if()