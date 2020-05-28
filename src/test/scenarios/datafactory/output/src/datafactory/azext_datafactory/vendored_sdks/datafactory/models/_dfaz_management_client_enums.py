# coding=utf-8
# --------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
# Code generated by Microsoft (R) AutoRest Code Generator.
# Changes may cause incorrect behavior and will be lost if the code is regenerated.
# --------------------------------------------------------------------------

from enum import Enum

class BlobEventTypes(str, Enum):

    microsoft_storage_blob_created = "Microsoft.Storage.BlobCreated"
    microsoft_storage_blob_deleted = "Microsoft.Storage.BlobDeleted"

class DataFlowComputeType(str, Enum):
    """Compute type of the cluster which will execute data flow job.
    """

    general = "General"
    memory_optimized = "MemoryOptimized"
    compute_optimized = "ComputeOptimized"

class DayOfWeek(str, Enum):
    """The days of the week.
    """

    sunday = "Sunday"
    monday = "Monday"
    tuesday = "Tuesday"
    wednesday = "Wednesday"
    thursday = "Thursday"
    friday = "Friday"
    saturday = "Saturday"

class DaysOfWeek(str, Enum):

    sunday = "Sunday"
    monday = "Monday"
    tuesday = "Tuesday"
    wednesday = "Wednesday"
    thursday = "Thursday"
    friday = "Friday"
    saturday = "Saturday"

class EventSubscriptionStatus(str, Enum):
    """Event Subscription Status.
    """

    enabled = "Enabled"
    provisioning = "Provisioning"
    deprovisioning = "Deprovisioning"
    disabled = "Disabled"
    unknown = "Unknown"

class IntegrationRuntimeAuthKeyName(str, Enum):
    """The name of the authentication key to regenerate.
    """

    auth_key1 = "authKey1"
    auth_key2 = "authKey2"

class IntegrationRuntimeAutoUpdate(str, Enum):
    """The state of integration runtime auto update.
    """

    on = "On"
    off = "Off"

class IntegrationRuntimeEdition(str, Enum):
    """The edition for the SSIS Integration Runtime
    """

    standard = "Standard"
    enterprise = "Enterprise"

class IntegrationRuntimeEntityReferenceType(str, Enum):
    """The type of this referenced entity.
    """

    integration_runtime_reference = "IntegrationRuntimeReference"
    linked_service_reference = "LinkedServiceReference"

class IntegrationRuntimeInternalChannelEncryptionMode(str, Enum):
    """It is used to set the encryption mode for node-node communication channel (when more than 2
    self-hosted integration runtime nodes exist).
    """

    not_set = "NotSet"
    ssl_encrypted = "SslEncrypted"
    not_encrypted = "NotEncrypted"

class IntegrationRuntimeLicenseType(str, Enum):
    """License type for bringing your own license scenario.
    """

    base_price = "BasePrice"
    license_included = "LicenseIncluded"

class IntegrationRuntimeSsisCatalogPricingTier(str, Enum):
    """The pricing tier for the catalog database. The valid values could be found in
    https://azure.microsoft.com/en-us/pricing/details/sql-database/
    """

    basic = "Basic"
    standard = "Standard"
    premium = "Premium"
    premium_rs = "PremiumRS"

class IntegrationRuntimeState(str, Enum):
    """The state of integration runtime.
    """

    initial = "Initial"
    stopped = "Stopped"
    started = "Started"
    starting = "Starting"
    stopping = "Stopping"
    need_registration = "NeedRegistration"
    online = "Online"
    limited = "Limited"
    offline = "Offline"
    access_denied = "AccessDenied"

class IntegrationRuntimeType(str, Enum):
    """The type of integration runtime.
    """

    managed = "Managed"
    self_hosted = "SelfHosted"

class IntegrationRuntimeUpdateResult(str, Enum):
    """The result of the last integration runtime node update.
    """

    none = "None"
    succeed = "Succeed"
    fail = "Fail"

class ManagedIntegrationRuntimeNodeStatus(str, Enum):
    """The managed integration runtime node status.
    """

    starting = "Starting"
    available = "Available"
    recycling = "Recycling"
    unavailable = "Unavailable"

class RecurrenceFrequency(str, Enum):
    """Enumerates possible frequency option for the schedule trigger.
    """

    not_specified = "NotSpecified"
    minute = "Minute"
    hour = "Hour"
    day = "Day"
    week = "Week"
    month = "Month"
    year = "Year"

class SelfHostedIntegrationRuntimeNodeStatus(str, Enum):
    """Status of the integration runtime node.
    """

    need_registration = "NeedRegistration"
    online = "Online"
    limited = "Limited"
    offline = "Offline"
    upgrading = "Upgrading"
    initializing = "Initializing"
    initialize_failed = "InitializeFailed"

class SsisObjectMetadataType(str, Enum):
    """The type of SSIS object metadata.
    """

    folder = "Folder"
    project = "Project"
    package = "Package"
    environment = "Environment"

class TriggerRuntimeState(str, Enum):
    """Enumerates possible state of Triggers.
    """

    started = "Started"
    stopped = "Stopped"
    disabled = "Disabled"

class TumblingWindowFrequency(str, Enum):
    """Enumerates possible frequency option for the tumbling window trigger.
    """

    minute = "Minute"
    hour = "Hour"