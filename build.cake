#tool "nuget:?package=xunit.runner.console&version=2.1.0"

//////////////////////////////////////////////////////////////////////
// ARGUMENTS
//////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

//////////////////////////////////////////////////////////////////////
// PREPARATION
//////////////////////////////////////////////////////////////////////

// Define directories.
var srcBuildDir = Directory("./src/Temporal/bin") + Directory(configuration);
var testsBuildDir = Directory("./tests/Temporal.Tests/bin") + Directory(configuration);
var artifactsDir = Directory("./artifacts");

//////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() =>
{
    CleanDirectory(srcBuildDir);
    CleanDirectory(testsBuildDir);
    CleanDirectory(artifactsDir);
});

Task("Restore-NuGet-Packages")
    .IsDependentOn("Clean")
    .Does(() =>
{
    NuGetRestore("./Temporal.sln");
});

Task("Build")
    .IsDependentOn("Restore-NuGet-Packages")
    .Does(() =>
{
    if(IsRunningOnWindows())
    {
      // Use MSBuild
      MSBuild("./Temporal.sln", settings =>
        settings.SetConfiguration(configuration)
                .WithProperty("TreatWarningsAsErrors", "True")
                .SetVerbosity(Verbosity.Minimal));
    }
    else
    {
      // Use XBuild
      XBuild("./Temporal.sln", settings =>
        settings.SetConfiguration(configuration)
                .WithProperty("TreatWarningsAsErrors", "True")
                .SetVerbosity(Verbosity.Minimal));
    }
});

Task("Run-Tests")
    .IsDependentOn("Build")
    .Does(() =>
{
    XUnit2("./tests/**/bin/" + configuration + "/*.Tests.dll", new XUnit2Settings {
    });
});

Task("Package")
    .IsDependentOn("Run-Tests")
    .Does(() =>
{
    NuGetPack("./src/Temporal/Temporal.nuspec", new NuGetPackSettings {
        OutputDirectory = artifactsDir
    });
});

//////////////////////////////////////////////////////////////////////
// TASK TARGETS
//////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Package");

//////////////////////////////////////////////////////////////////////
// EXECUTION
//////////////////////////////////////////////////////////////////////

RunTarget(target);
