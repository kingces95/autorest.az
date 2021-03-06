# coding=utf-8
# --------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
# Code generated by Microsoft (R) AutoRest Code Generator.
# Changes may cause incorrect behavior and will be lost if the code is regenerated.
# --------------------------------------------------------------------------
from typing import Any, Callable, Dict, Generic, List, Optional, TypeVar, Union
import warnings

from azure.core.exceptions import ClientAuthenticationError, HttpResponseError, ResourceExistsError, ResourceNotFoundError, map_error
from azure.core.pipeline import PipelineResponse
from azure.core.pipeline.transport import AsyncHttpResponse, HttpRequest
from azure.mgmt.core.exceptions import ARMErrorFormat

from ... import models

T = TypeVar('T')
ClsType = Optional[Callable[[PipelineResponse[HttpRequest, AsyncHttpResponse], T, Dict[str, Any]], Any]]

class SQLPoolSecurityAlertPolicyOperations:
    """SQLPoolSecurityAlertPolicyOperations async operations.

    You should not instantiate this class directly. Instead, you should create a Client instance that
    instantiates it for you and attaches it as an attribute.

    :ivar models: Alias to model classes used in this operation group.
    :type models: ~synapse_management_client.models
    :param client: Client for service requests.
    :param config: Configuration of service client.
    :param serializer: An object model serializer.
    :param deserializer: An object model deserializer.
    """

    models = models

    def __init__(self, client, config, serializer, deserializer) -> None:
        self._client = client
        self._serialize = serializer
        self._deserialize = deserializer
        self._config = config

    async def get(
        self,
        resource_group_name: str,
        workspace_name: str,
        sql_pool_name: str,
        security_alert_policy_name: Union[str, "models.SecurityAlertPolicyName"],
        **kwargs
    ) -> "models.SQLPoolSecurityAlertPolicy":
        """Get a Sql pool's security alert policy.

        Get a Sql pool's security alert policy.

        :param resource_group_name: The name of the resource group. The name is case insensitive.
        :type resource_group_name: str
        :param workspace_name: The name of the workspace.
        :type workspace_name: str
        :param sql_pool_name: SQL pool name.
        :type sql_pool_name: str
        :param security_alert_policy_name: The name of the security alert policy.
        :type security_alert_policy_name: str or ~synapse_management_client.models.SecurityAlertPolicyName
        :keyword callable cls: A custom type or function that will be passed the direct response
        :return: SQLPoolSecurityAlertPolicy, or the result of cls(response)
        :rtype: ~synapse_management_client.models.SQLPoolSecurityAlertPolicy
        :raises: ~azure.core.exceptions.HttpResponseError
        """
        cls = kwargs.pop('cls', None)  # type: ClsType["models.SQLPoolSecurityAlertPolicy"]
        error_map = {
            401: ClientAuthenticationError, 404: ResourceNotFoundError, 409: ResourceExistsError
        }
        error_map.update(kwargs.pop('error_map', {}))
        api_version = "2019-06-01-preview"
        accept = "application/json"

        # Construct URL
        url = self.get.metadata['url']  # type: ignore
        path_format_arguments = {
            'subscriptionId': self._serialize.url("self._config.subscription_id", self._config.subscription_id, 'str', min_length=1),
            'resourceGroupName': self._serialize.url("resource_group_name", resource_group_name, 'str', max_length=90, min_length=1, pattern=r'^[-\w\._\(\)]+$'),
            'workspaceName': self._serialize.url("workspace_name", workspace_name, 'str'),
            'sqlPoolName': self._serialize.url("sql_pool_name", sql_pool_name, 'str'),
            'securityAlertPolicyName': self._serialize.url("security_alert_policy_name", security_alert_policy_name, 'str'),
        }
        url = self._client.format_url(url, **path_format_arguments)

        # Construct parameters
        query_parameters = {}  # type: Dict[str, Any]
        query_parameters['api-version'] = self._serialize.query("api_version", api_version, 'str')

        # Construct headers
        header_parameters = {}  # type: Dict[str, Any]
        header_parameters['Accept'] = self._serialize.header("accept", accept, 'str')

        request = self._client.get(url, query_parameters, header_parameters)
        pipeline_response = await self._client._pipeline.run(request, stream=False, **kwargs)
        response = pipeline_response.http_response

        if response.status_code not in [200]:
            map_error(status_code=response.status_code, response=response, error_map=error_map)
            raise HttpResponseError(response=response, error_format=ARMErrorFormat)

        deserialized = self._deserialize('SQLPoolSecurityAlertPolicy', pipeline_response)

        if cls:
            return cls(pipeline_response, deserialized, {})

        return deserialized
    get.metadata = {'url': '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Synapse/workspaces/{workspaceName}/sqlPools/{sqlPoolName}/securityAlertPolicies/{securityAlertPolicyName}'}  # type: ignore

    async def create_or_update(
        self,
        resource_group_name: str,
        workspace_name: str,
        sql_pool_name: str,
        security_alert_policy_name: Union[str, "models.SecurityAlertPolicyName"],
        state: Optional[Union[str, "models.SecurityAlertPolicyState"]] = None,
        disabled_alerts: Optional[List[str]] = None,
        email_addresses: Optional[List[str]] = None,
        email_account_admins: Optional[bool] = None,
        storage_endpoint: Optional[str] = None,
        storage_account_access_key: Optional[str] = None,
        retention_days: Optional[int] = None,
        **kwargs
    ) -> "models.SQLPoolSecurityAlertPolicy":
        """Create or update a Sql pool's security alert policy.

        Create or update a Sql pool's security alert policy.

        :param resource_group_name: The name of the resource group. The name is case insensitive.
        :type resource_group_name: str
        :param workspace_name: The name of the workspace.
        :type workspace_name: str
        :param sql_pool_name: SQL pool name.
        :type sql_pool_name: str
        :param security_alert_policy_name: The name of the security alert policy.
        :type security_alert_policy_name: str or ~synapse_management_client.models.SecurityAlertPolicyName
        :param state: Specifies the state of the policy, whether it is enabled or disabled or a policy
         has not been applied yet on the specific Sql pool.
        :type state: str or ~synapse_management_client.models.SecurityAlertPolicyState
        :param disabled_alerts: Specifies an array of alerts that are disabled. Allowed values are:
         Sql_Injection, Sql_Injection_Vulnerability, Access_Anomaly, Data_Exfiltration, Unsafe_Action.
        :type disabled_alerts: list[str]
        :param email_addresses: Specifies an array of e-mail addresses to which the alert is sent.
        :type email_addresses: list[str]
        :param email_account_admins: Specifies that the alert is sent to the account administrators.
        :type email_account_admins: bool
        :param storage_endpoint: Specifies the blob storage endpoint (e.g.
         https://MyAccount.blob.core.windows.net). This blob storage will hold all Threat Detection
         audit logs.
        :type storage_endpoint: str
        :param storage_account_access_key: Specifies the identifier key of the Threat Detection audit
         storage account.
        :type storage_account_access_key: str
        :param retention_days: Specifies the number of days to keep in the Threat Detection audit logs.
        :type retention_days: int
        :keyword callable cls: A custom type or function that will be passed the direct response
        :return: SQLPoolSecurityAlertPolicy, or the result of cls(response)
        :rtype: ~synapse_management_client.models.SQLPoolSecurityAlertPolicy
        :raises: ~azure.core.exceptions.HttpResponseError
        """
        cls = kwargs.pop('cls', None)  # type: ClsType["models.SQLPoolSecurityAlertPolicy"]
        error_map = {
            401: ClientAuthenticationError, 404: ResourceNotFoundError, 409: ResourceExistsError
        }
        error_map.update(kwargs.pop('error_map', {}))

        parameters = models.SQLPoolSecurityAlertPolicy(state=state, disabled_alerts=disabled_alerts, email_addresses=email_addresses, email_account_admins=email_account_admins, storage_endpoint=storage_endpoint, storage_account_access_key=storage_account_access_key, retention_days=retention_days)
        api_version = "2019-06-01-preview"
        content_type = kwargs.pop("content_type", "application/json")
        accept = "application/json"

        # Construct URL
        url = self.create_or_update.metadata['url']  # type: ignore
        path_format_arguments = {
            'subscriptionId': self._serialize.url("self._config.subscription_id", self._config.subscription_id, 'str', min_length=1),
            'resourceGroupName': self._serialize.url("resource_group_name", resource_group_name, 'str', max_length=90, min_length=1, pattern=r'^[-\w\._\(\)]+$'),
            'workspaceName': self._serialize.url("workspace_name", workspace_name, 'str'),
            'sqlPoolName': self._serialize.url("sql_pool_name", sql_pool_name, 'str'),
            'securityAlertPolicyName': self._serialize.url("security_alert_policy_name", security_alert_policy_name, 'str'),
        }
        url = self._client.format_url(url, **path_format_arguments)

        # Construct parameters
        query_parameters = {}  # type: Dict[str, Any]
        query_parameters['api-version'] = self._serialize.query("api_version", api_version, 'str')

        # Construct headers
        header_parameters = {}  # type: Dict[str, Any]
        header_parameters['Content-Type'] = self._serialize.header("content_type", content_type, 'str')
        header_parameters['Accept'] = self._serialize.header("accept", accept, 'str')

        body_content_kwargs = {}  # type: Dict[str, Any]
        body_content = self._serialize.body(parameters, 'SQLPoolSecurityAlertPolicy')
        body_content_kwargs['content'] = body_content
        request = self._client.put(url, query_parameters, header_parameters, **body_content_kwargs)
        pipeline_response = await self._client._pipeline.run(request, stream=False, **kwargs)
        response = pipeline_response.http_response

        if response.status_code not in [200, 201]:
            map_error(status_code=response.status_code, response=response, error_map=error_map)
            raise HttpResponseError(response=response, error_format=ARMErrorFormat)

        if response.status_code == 200:
            deserialized = self._deserialize('SQLPoolSecurityAlertPolicy', pipeline_response)

        if response.status_code == 201:
            deserialized = self._deserialize('SQLPoolSecurityAlertPolicy', pipeline_response)

        if cls:
            return cls(pipeline_response, deserialized, {})

        return deserialized
    create_or_update.metadata = {'url': '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.Synapse/workspaces/{workspaceName}/sqlPools/{sqlPoolName}/securityAlertPolicies/{securityAlertPolicyName}'}  # type: ignore
