import { replacePlaceholdersInYaml } from '~/__tests__/cypress/cypress/utils/yaml_files';
import { applyOpenShiftYaml } from './baseCommands';

/**
 * Try to create a data connection based on the dataConnectionReplacements config
 * @param dataConnectionReplacements Dictionary with the config values
 *      Dict Structure:
 *              dataConnectionReplacements = {
 *                  NAMESPACE: <PROJECT NAME>,
 *                  AWS_ACCESS_KEY_ID: <AWS ACCESS KEY ID>,
 *                  AWS_DEFAULT_REGION: <AWS REGION>,
 *                  AWS_S3_BUCKET: <AWS BUCKET NAME>,
 *                  AWS_S3_ENDPOINT: <AWS ENDPOINT>,
 *                  AWS_SECRET_ACCESS_KEY: <AWS SECRET>,
 *               }
 * @param yamlFilePath
 */
export const createDataConnection = (
  dataConnectionReplacements: { [key: string]: string },
  yamlFilePath = 'resources/yaml/data_connection.yaml',
) => {
  cy.fixture(yamlFilePath).then((yamlContent) => {
    const modifiedYamlContent = replacePlaceholdersInYaml(yamlContent, dataConnectionReplacements);
    applyOpenShiftYaml(modifiedYamlContent).then((result) => {
      return result;
    });
  });
};