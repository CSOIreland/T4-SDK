# JS Organisation Chart Library for "Terminal Four" CMS

This documentation outlines the content types used in the JS Organisation Chart Library developed for the "Terminal Four" CMS.

<details>
<summary><strong>Organisation Chart Container - Start</strong></summary>
<br>

**Description:**  
Wrapper content type used to contain the defined data structure and the newly instantiated organisation chart. It defines the top parent node, which is mandatory. Each chart instance requires one container.

**Inputs:**

| Input Field        | Description                                      | Type                   | Required |
|--------------------|--------------------------------------------------|------------------------|----------|
| Employee Name      | Name of the employee                             | String (80 char max)   | Yes      |
| Title              | Title of the employee                            | String (80 char max)   | Yes      |
| Department         | Department of the employee                       | String (80 char max)   | Yes      |
| Bio (Biography)    | Biography of the employee                        | HTML String (5000 char)| No       |
| Image              | Image path of the employee                       | Media Path             | No       |
| Acting             | Adds 'Acting' in front of title                  | Checkbox               | No       |
| Depth              | Level at which nodes start collapsing            | Number                 | No       |
| Vertical Depth     | Level at which nodes display vertically          | Number                 | No       |

</details>

<details>
<summary><strong>Organisation Chart Container - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart Container.

</details>

<details>
<summary><strong>Organisation Chart Child List - Start</strong></summary>
<br>

**Description:**  
Wrapper for child items in the organisation chart. Each new level must be wrapped in this content type.

</details>

<details>
<summary><strong>Organisation Chart Child List - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart Child List. The immediate parent must be either a child list item or an organisation chart container.

</details>

<details>
<summary><strong>Organisation Chart List Item - Start</strong></summary>
<br>

**Description:**  
Defines a child node in the organisation chart, allowing for the nesting of other child lists.

**Inputs:**  
Same as the Organisation Chart Container, excluding 'Depth' and 'Vertical Depth'.

</details>

<details>
<summary><strong>Organisation Chart List Item - End</strong></summary>
<br>

**Description:**  
Closing tag for the Organisation Chart List Item.

</details>

<details>
<summary><strong>Organisation Chart List Item - Leaf</strong></summary>
<br>

**Description:**  
Similar to the Organisation Chart List Item Start, but does not allow nesting. Includes the closing tag within.

**Inputs:**  
Same as the Organisation Chart List Item.

</details>
