import type {
  CommandLineResult,
  StorageClassConfig,
  SCReplacements,
} from '~/__tests__/cypress/cypress/types';
import {
  createStorageClass,
  deleteStorageClass,
  getStorageClassConfig,
} from '~/__tests__/cypress/cypress/utils/oc_commands/storageClass';
import {
  createOpenShiftProject,
  deleteOpenShiftProject,
  addUserToProject,
} from '~/__tests__/cypress/cypress/utils/oc_commands/project';

/**
 * Provision (using oc) all necessary resources for the Storage Class testing feature
 * (Settings -> Storage Classes)
 *
 * @param scName Project Name
 */
export const provisionStorageClassFeature = (scName: string): string[] => {
  const createdStorageClasses: string[] = [];

  //Provision a disabled non-default sc
  const scNameDisabledNonDefault = `${scName}-disabled-non-default`;
  let SCReplacement: SCReplacements = {
    SC_NAME: scNameDisabledNonDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'false',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameDisabledNonDefault);

  //Provision an enabled non-default sc
  const scNameEnabledNonDefault = `${scName}-enabled-non-default`;
  SCReplacement = {
    SC_NAME: scNameEnabledNonDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'true',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameEnabledNonDefault);

  //Provision an enabled non-default sc in order to set it as default
  const scNameEnabledToDefault = `${scName}-enabled-to-default`;
  SCReplacement = {
    SC_NAME: scNameEnabledToDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'true',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameEnabledToDefault);

  //Provision an enabled non-default sc in order to set it as default
  const scNameEnabledAndDefault = `${scName}-enabled-and-default`;
  SCReplacement = {
    SC_NAME: scNameEnabledAndDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'true',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameEnabledAndDefault);

  return createdStorageClasses;
};

export const tearDownStorageClassFeature = (createdSC: string[]): void => {
  createdSC.forEach((scName) => {
    cy.log(`Deleting storage class: os-sc-${scName}`);
    deleteStorageClass(`os-sc-${scName}`);
  });
};

/**
 * Provision (using oc) all necessary resources for the Storage Class testing feature
 * (DSProject Cluster Storage tab)
 *
 * @param scName Project Name
 */
export const provisionClusterStorageSCFeature = (
  projectName: string,
  userName: string,
  scName: string,
): string[] => {
  // Provision a Project
  createOpenShiftProject(projectName);
  addUserToProject(projectName, userName);

  const createdStorageClasses: string[] = [];
  // Provision an enabled SC
  const scNameEnabledToDefault = `${scName}-enabled`;
  let SCReplacement: SCReplacements = {
    SC_NAME: scNameEnabledToDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'true',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameEnabledToDefault);

  // Provision an enabled SC
  const scNameDisabledToDefault = `${scName}-disabled`;
  SCReplacement = {
    SC_NAME: scNameDisabledToDefault,
    SC_IS_DEFAULT: 'false',
    SC_IS_ENABLED: 'false',
  };
  createStorageClass(SCReplacement);
  createdStorageClasses.push(scNameDisabledToDefault);

  return createdStorageClasses;
};

/**
 * Delete (using oc) all created resources for the Storage Class testing feature
 * (DSProject Cluster Storage tab)
 *
 * @param scName Project Name
 */
export const tearDownClusterStorageSCFeature = (projectName: string, createdSC: string[]): void => {
  // Delete provisioned projectName
  deleteOpenShiftProject(projectName);
  // Delete provisioned SCs
  createdSC.forEach((scName) => {
    cy.log(`Deleting storage class: os-sc-${scName}`);
    deleteStorageClass(`os-sc-${scName}`);
  });
};

/**
 * Parse Storage Class Configuration
 *
 * @param result Output from getStorageClassConfig
 * @returns StorageClassConfig object
 */
export const parseStorageClassConfig = (result: CommandLineResult): StorageClassConfig => {
  const rawConfig = JSON.parse(result.stdout);
  const config: StorageClassConfig = {
    isDefault: rawConfig.isDefault,
    isEnabled: rawConfig.isEnabled,
    displayName: rawConfig.displayName,
    description: rawConfig.description,
  };

  // If description is undefined, remove it from the final object
  if (config.description === undefined) {
    delete config.description;
  }

  return config;
};

/**
 * Verify Storage Class Configuration retrieving the info using OC
 *
 * @param scName - Storage Class to verify
 * @param expectedIsDefault (Optional) expected isDefault
 * @param expectedIsEnabled (Optional) expected isEnabled
 * @param expectedDisplayName (Optional) expected Display Name
 * @param expectedDescription (Optional) expected Description
 */
export const verifyStorageClassConfig = (
  scName: string,
  expectedIsDefault?: boolean,
  expectedIsEnabled?: boolean,
  expectedDisplayName?: string,
  expectedDescription?: string,
): Cypress.Chainable<CommandLineResult> => {
  return getStorageClassConfig(scName).then((result) => {
    const config = parseStorageClassConfig(result);

    if (expectedIsDefault !== undefined) {
      cy.wrap(config.isDefault).should('equal', expectedIsDefault);
    }

    if (expectedIsEnabled !== undefined) {
      cy.wrap(config.isEnabled).should('equal', expectedIsEnabled);
    }

    if (expectedDisplayName !== undefined) {
      cy.wrap(config.displayName).should('equal', expectedDisplayName);
    }

    if (expectedDescription !== undefined) {
      if (expectedDescription === '') {
        cy.wrap(config.description).should('be.undefined');
      } else {
        cy.wrap(config.description).should('equal', expectedDescription);
      }
    }
    cy.log('Storage Class Config:', JSON.stringify(config));
    return cy.wrap(result);
  });
};