// ---------- SETS ----------
int m = ...;                 // number of boxes
range I = 1..m;
range IJ = 1..m;

// ---------- PARAMETERS ----------
float M = ...;               // big M

float v[I];                  // value
float l[I];                  // length
float w[I];                  // width
float h[I];                  // height

float L = ...;               // container length
float W = ...;               // container width
float H = ...;               // container height

float X0 = ...;
float Y0 = ...;
float Z0 = ...;

// ---------- DECISION VARIABLES ----------
dvar boolean p[I];           // box selected

dvar float+ x[I];
dvar float+ y[I];
dvar float+ z[I];

// relative positions
dvar boolean a[I][I]; // i left of j
dvar boolean b[I][I]; // i right of j
dvar boolean c[I][I]; // i in front of j
dvar boolean d[I][I]; // i behind j
dvar boolean e[I][I]; // i below j
dvar boolean f[I][I]; // i above j

// ---------- OBJECTIVE ----------
maximize sum(i in I) v[i] * p[i];

// ---------- CONSTRAINTS ----------

// Non-overlap constraints
subject to {

  forall(i in I, j in I : i < j) {

    x[i] + l[i] <= x[j] + (1 - a[i][j]) * M;
    x[j] + l[j] <= x[i] + (1 - b[i][j]) * M;

    y[i] + w[i] <= y[j] + (1 - c[i][j]) * M;
    y[j] + w[j] <= y[i] + (1 - d[i][j]) * M;

    z[i] + h[i] <= z[j] + (1 - e[i][j]) * M;
    z[j] + h[j] <= z[i] + (1 - f[i][j]) * M;

    a[i][j] + b[i][j] + c[i][j] + d[i][j] + e[i][j] + f[i][j] >= 1;
  }

  // inside container
  forall(i in I) {
    x[i] >= X0 * p[i];
    y[i] >= Y0 * p[i];
    z[i] >= Z0 * p[i];

    x[i] + l[i] <= (X0 + L) * p[i];
    y[i] + w[i] <= (Y0 + W) * p[i];
    z[i] + h[i] <= (Z0 + H) * p[i];
  }
}/*********************************************
 * OPL 22.1.2.0 Model
 * Author: HongAn
 * Creation Date: Apr 21, 2026 at 8:56:37 AM
 *********************************************/
